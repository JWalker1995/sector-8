CREATE SCHEMA IF NOT EXISTS sector8;
USE sector8;

CREATE TABLE IF NOT EXISTS sector8.users (
	user_id INT UNSIGNED NOT NULL,
	username VARCHAR(255) NOT NULL,
	password_hash VARCHAR(255),
	email VARCHAR(255),
	registration_code VARCHAR(255),
	first_login DATETIME NOT NULL,
	last_login DATETIME NOT NULL,
	CONSTRAINT `PRIMARY` PRIMARY KEY (user_id)
);

CREATE TABLE IF NOT EXISTS sector8.user_stats (
	user_id INT UNSIGNED NOT NULL,
	count_total INT UNSIGNED NOT NULL,
	count_legendary_wins INT UNSIGNED NOT NULL,
	count_wins INT UNSIGNED NOT NULL,
	count_draws INT UNSIGNED NOT NULL,
	count_losses INT UNSIGNED NOT NULL,
	count_dishonorable_losses INT UNSIGNED NOT NULL,
	rating FLOAT NOT NULL,
	CONSTRAINT `PRIMARY` PRIMARY KEY (user_id)
);

CREATE TABLE IF NOT EXISTS sector8.matches (
	match_id INT UNSIGNED NOT NULL,
	name VARCHAR(255),
	start_date DATETIME,
	end_date DATETIME,
	map_id INT UNSIGNED NOT NULL,
	orders VARCHAR(1023) NOT NULL,
	board VARCHAR(1023) NOT NULL,
	move_after INT NOT NULL,
	move_where INT NOT NULL,
	timer_type INT NOT NULL,
	shadow BIT NOT NULL,
	spectators BIT NOT NULL,
	stakes FLOAT NOT NULL,
	CONSTRAINT `PRIMARY` PRIMARY KEY (match_id)
);

CREATE TABLE IF NOT EXISTS sector8.players (
	player_id INT UNSIGNED NOT NULL,
	match_id INT UNSIGNED NOT NULL,
	user_id INT UNSIGNED NOT NULL,
	CONSTRAINT `PRIMARY` PRIMARY KEY (player_id)
);

CREATE TABLE IF NOT EXISTS sector8.maps (
	map_id INT UNSIGNED NOT NULL,
	name VARCHAR(255),
	creator_id INT UNSIGNED NOT NULL,
	creation_date DATETIME NOT NULL,
	num_players INT UNSIGNED NOT NULL,
	board VARCHAR(1023) NOT NULL,
	symmetry_flip_x BIT NOT NULL,
	symmetry_flip_y BIT NOT NULL,
	symmetry_rot_90 BIT NOT NULL,
	symmetry_rot_180 BIT NOT NULL,
	CONSTRAINT `PRIMARY` PRIMARY KEY (map_id)
);