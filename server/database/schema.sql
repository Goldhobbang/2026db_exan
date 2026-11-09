CREATE DATABASE IF NOT EXISTS club_recruit_20512
  DEFAULT CHARACTER SET utf8mb4
  DEFAULT COLLATE utf8mb4_0900_ai_ci;

USE club_recruit_20512;

CREATE TABLE IF NOT EXISTS users_20512 (
  id INT NOT NULL AUTO_INCREMENT,
  email VARCHAR(100) NOT NULL,
  password VARCHAR(255) NOT NULL,
  nickname VARCHAR(50) NOT NULL,
  phone_number VARCHAR(20) NOT NULL,
  entry_year INT NOT NULL,
  student_id VARCHAR(10) NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uk_users_email (email),
  UNIQUE KEY uk_users_phone_number (phone_number),
  UNIQUE KEY uk_users_entry_student (entry_year, student_id),
  CONSTRAINT chk_users_entry_year CHECK (entry_year BETWEEN 1980 AND 2100)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- 핵심 테이블 1: 동아리 모집 공고 (작성자=개설자)
CREATE TABLE IF NOT EXISTS clubs_20512 (
  id INT NOT NULL AUTO_INCREMENT,
  owner_id INT NOT NULL,
  name VARCHAR(80) NOT NULL,
  category VARCHAR(20) NOT NULL,
  description TEXT NOT NULL,
  max_members INT NOT NULL DEFAULT 10,
  status ENUM('RECRUITING','CLOSED') NOT NULL DEFAULT 'RECRUITING',
  location VARCHAR(100) NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  KEY idx_clubs_owner (owner_id),
  KEY idx_clubs_category_created (category, created_at),
  CONSTRAINT fk_clubs_owner FOREIGN KEY (owner_id) REFERENCES users_20512 (id) ON DELETE CASCADE,
  CONSTRAINT chk_clubs_max CHECK (max_members >= 1)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- 핵심 테이블 2: 지원서 (신청자 본인만 취소, 개설자는 승인/거절)
CREATE TABLE IF NOT EXISTS applications_20512 (
  id INT NOT NULL AUTO_INCREMENT,
  club_id INT NOT NULL,
  user_id INT NOT NULL,
  motive VARCHAR(500) NOT NULL,
  status ENUM('PENDING','APPROVED','REJECTED') NOT NULL DEFAULT 'PENDING',
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uk_app_club_user (club_id, user_id),
  KEY idx_app_club (club_id),
  KEY idx_app_user (user_id),
  CONSTRAINT fk_app_club FOREIGN KEY (club_id) REFERENCES clubs_20512 (id) ON DELETE CASCADE,
  CONSTRAINT fk_app_user FOREIGN KEY (user_id) REFERENCES users_20512 (id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
