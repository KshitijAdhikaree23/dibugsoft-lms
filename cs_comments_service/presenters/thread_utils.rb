require 'logger'


module ThreadUtils

  def self.get_endorsed(threads)
    # returns sparse hash {thread_key => true, ...}
    # only threads which are endorsed will have entries, value will always be true.
    endorsed_threads = {}
    thread_ids = threads.collect {|t| t._id}
    Comment.collection.aggregate([
      {"$match" => {"comment_thread_id" => {"$in" => thread_ids}, "endorsed" => true}},
      {"$group" => {"_id" => "$comment_thread_id"}}
    ]).each do |res|
      endorsed_threads[res["_id"].to_s] = true
    end
    endorsed_threads
  end

  def self.get_abuse_flagged_count(threads)
    # returns a count of flagged threads for all comments within the thread
    # only threads with at least one flag are returned
    flagged_threads = {}
    thread_ids = threads.collect {|t| t._id}
    Comment.collection.aggregate([
      {"$match" => {
        "comment_thread_id" => {"$in" => thread_ids},
        "abuse_flaggers"=> {"$ne"=> []},
      }},
      {"$group" => {"_id" => "$comment_thread_id", "flagged" => { "$sum" => 1}} }
    ]).each do |res|
      flagged_threads[res["_id"].to_s] = res["flagged"]
    end
    flagged_threads
  end

  def self.get_read_states(threads, user, course_id)
    # returns sparse hash {thread_key => [is_read, unread_comment_count], ...}
    read_states = {}
    if user
      read_dates = {}
      read_state = user.read_states.where(:course_id => course_id).first
      if read_state
        read_dates = read_state["last_read_times"].to_hash
        threads.each do |t|
          thread_key = t._id.to_s
          if read_dates.has_key? thread_key
            is_read = read_dates[thread_key] >= t.last_activity_at
            unread_comment_count = Comment.collection.find(
              :comment_thread_id => t._id,
              :author_id => {"$ne" => user.id},
              :created_at => {"$gte" => read_dates[thread_key]}
              ).count
            read_states[thread_key] = [is_read, unread_comment_count]
          end
        end
      end
    end
    read_states
  end

  class << self
    logger = Logger.new(STDOUT)
    logger.level = Logger::WARN
    begin
      require 'new_relic/agent/method_tracer'
      include ::NewRelic::Agent::MethodTracer
      add_method_tracer :get_read_states
      add_method_tracer :get_endorsed
    rescue LoadError
      logger.warn "NewRelic agent library not installed"
    end
  end

end
