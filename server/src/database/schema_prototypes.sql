CREATE TABLE recurrence_rules (
    id SERIAL PRIMARY KEY,
    task_id INT REFERENCES tasks(id) ON DELETE CASCADE, -- Foreign key to tasks
    frequency VARCHAR(50) NOT NULL, -- e.g., 'daily', 'weekly', 'monthly', 'yearly'
    interval INT NOT NULL CHECK (interval > 0), -- How often it repeats
    day_of_week VARCHAR(20), -- e.g., 'Monday', 'Wednesday' (optional, if applicable)
    week_of_month INT, -- 1-5 for first to fifth week, NULL if not applicable
    specific_days INT[], -- Array of specific days of the month (e.g., {11, 15, 30})
    last_week BOOLEAN DEFAULT FALSE, -- TRUE if it’s meant for the last week of the month
    month_of_year INT, -- 1-12 for January to December, for yearly tasks
    UNIQUE(task_id), -- Ensure each task has one recurrence rule
    scheduled_start_time TIME, -- The time of day the task is scheduled (e.g., '14:00:00')
    is_active BOOLEAN DEFAULT TRUE, -- ta check if this schedule should be applied
    starts_at TIMESTAMP NOT NULL, -- to mark the date when schedule starts
    ends_at TIMESTAMP -- if task had limited time or when task schedule needs to be stopped at.
);


CREATE TABLE completed_tasks (
    id SERIAL PRIMARY KEY,
    task_id INT REFERENCES tasks(id) ON DELETE CASCADE, -- Foreign key to tasks
    completed_at TIMESTAMP NOT NULL, -- When the task was completed
    instance_date TIMESTAMP NOT NULL, -- Optional: Date when this task instance was scheduled (if applicable)
    UNIQUE(task_id, completed_at) -- Ensure unique entries for each completion
);

CREATE TABLE tasks (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    is_completed BOOLEAN DEFAULT FALSE, -- Marks if the task is currently completed
    completed_at TIMESTAMP, -- When the task was completed (optional, can be NULL for non-completed tasks)
    is_recurring BOOLEAN DEFAULT FALSE, -- Indicate if the task is recurring
    scheduled_at TIMESTAMP -- for task that appear only once at a certain date and time
);