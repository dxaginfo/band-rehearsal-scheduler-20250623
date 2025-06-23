import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  // Users table
  await knex.schema.createTable('users', (table) => {
    table.uuid('id').primary();
    table.string('email').notNullable().unique();
    table.string('password_hash').notNullable();
    table.string('first_name').notNullable();
    table.string('last_name').notNullable();
    table.string('phone');
    table.string('profile_image');
    table.string('default_instrument');
    table.timestamp('created_at').notNullable();
    table.timestamp('updated_at').notNullable();
  });

  // Bands table
  await knex.schema.createTable('bands', (table) => {
    table.uuid('id').primary();
    table.string('name').notNullable();
    table.text('description');
    table.string('logo_image');
    table.uuid('created_by').references('id').inTable('users').onDelete('CASCADE');
    table.timestamp('created_at').notNullable();
    table.timestamp('updated_at').notNullable();
  });

  // Band members table
  await knex.schema.createTable('band_members', (table) => {
    table.uuid('id').primary();
    table.uuid('band_id').references('id').inTable('bands').onDelete('CASCADE');
    table.uuid('user_id').references('id').inTable('users').onDelete('CASCADE');
    table.enum('role', ['admin', 'member']).defaultTo('member');
    table.string('instrument');
    table.timestamp('join_date').notNullable();
    table.boolean('is_active').defaultTo(true);
    table.timestamp('created_at').notNullable();
    table.timestamp('updated_at').notNullable();
    
    // Unique constraint to prevent duplicate band memberships
    table.unique(['band_id', 'user_id']);
  });

  // Rehearsals table
  await knex.schema.createTable('rehearsals', (table) => {
    table.uuid('id').primary();
    table.uuid('band_id').references('id').inTable('bands').onDelete('CASCADE');
    table.string('title').notNullable();
    table.text('description');
    table.string('location');
    table.timestamp('start_time').notNullable();
    table.timestamp('end_time').notNullable();
    table.boolean('is_recurring').defaultTo(false);
    table.jsonb('recurrence_pattern');
    table.uuid('created_by').references('id').inTable('users').onDelete('SET NULL');
    table.timestamp('created_at').notNullable();
    table.timestamp('updated_at').notNullable();
  });

  // Availability table
  await knex.schema.createTable('availability', (table) => {
    table.uuid('id').primary();
    table.uuid('user_id').references('id').inTable('users').onDelete('CASCADE');
    table.integer('day_of_week').notNullable(); // 0-6 for Sunday-Saturday
    table.time('start_time').notNullable();
    table.time('end_time').notNullable();
    table.timestamp('created_at').notNullable();
    table.timestamp('updated_at').notNullable();
  });

  // Attendance table
  await knex.schema.createTable('attendance', (table) => {
    table.uuid('id').primary();
    table.uuid('rehearsal_id').references('id').inTable('rehearsals').onDelete('CASCADE');
    table.uuid('user_id').references('id').inTable('users').onDelete('CASCADE');
    table.enum('status', ['attending', 'maybe', 'declined']).defaultTo('maybe');
    table.boolean('attendance_confirmed').defaultTo(false);
    table.text('notes');
    table.timestamp('created_at').notNullable();
    table.timestamp('updated_at').notNullable();
    
    // Unique constraint to prevent duplicate attendance records
    table.unique(['rehearsal_id', 'user_id']);
  });

  // Notifications table
  await knex.schema.createTable('notifications', (table) => {
    table.uuid('id').primary();
    table.uuid('user_id').references('id').inTable('users').onDelete('CASCADE');
    table.uuid('rehearsal_id').references('id').inTable('rehearsals').onDelete('CASCADE');
    table.enum('type', ['new_rehearsal', 'update', 'reminder', 'cancellation']).notNullable();
    table.text('content').notNullable();
    table.boolean('is_read').defaultTo(false);
    table.timestamp('sent_at').notNullable();
    table.timestamp('created_at').notNullable();
  });

  // Materials table
  await knex.schema.createTable('materials', (table) => {
    table.uuid('id').primary();
    table.uuid('rehearsal_id').references('id').inTable('rehearsals').onDelete('CASCADE');
    table.string('title').notNullable();
    table.text('description');
    table.string('file_url').notNullable();
    table.string('file_type');
    table.uuid('uploaded_by').references('id').inTable('users').onDelete('SET NULL');
    table.timestamp('created_at').notNullable();
    table.timestamp('updated_at').notNullable();
  });

  // Comments table
  await knex.schema.createTable('comments', (table) => {
    table.uuid('id').primary();
    table.uuid('rehearsal_id').references('id').inTable('rehearsals').onDelete('CASCADE');
    table.uuid('user_id').references('id').inTable('users').onDelete('CASCADE');
    table.text('content').notNullable();
    table.timestamp('created_at').notNullable();
    table.timestamp('updated_at').notNullable();
  });

  // Refresh tokens table
  await knex.schema.createTable('refresh_tokens', (table) => {
    table.uuid('id').primary();
    table.uuid('user_id').references('id').inTable('users').onDelete('CASCADE');
    table.text('token').notNullable();
    table.timestamp('created_at').notNullable();
    table.timestamp('expires_at').notNullable();
  });
}

export async function down(knex: Knex): Promise<void> {
  // Drop tables in reverse order to avoid foreign key constraints
  await knex.schema.dropTableIfExists('refresh_tokens');
  await knex.schema.dropTableIfExists('comments');
  await knex.schema.dropTableIfExists('materials');
  await knex.schema.dropTableIfExists('notifications');
  await knex.schema.dropTableIfExists('attendance');
  await knex.schema.dropTableIfExists('availability');
  await knex.schema.dropTableIfExists('rehearsals');
  await knex.schema.dropTableIfExists('band_members');
  await knex.schema.dropTableIfExists('bands');
  await knex.schema.dropTableIfExists('users');
}
