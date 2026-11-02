-- ============================================================
-- School Market (교내 중고거래 및 무료 나눔 플랫폼)
-- MySQL 8.0+ 스키마
--
-- 실행 방법:
--   mysql -u root -p < database/schema.sql
-- 또는 MySQL Workbench에서 이 파일을 열고 전체 실행
-- ============================================================

CREATE DATABASE IF NOT EXISTS school_market_20512
  DEFAULT CHARACTER SET utf8mb4
  DEFAULT COLLATE utf8mb4_0900_ai_ci;

USE school_market_20512;

-- ------------------------------------------------------------
-- 1. 회원 (users)
--    - 이메일, 전화번호, (입학년도 + 학번)은 중복 가입 불가
--    - 비밀번호는 bcrypt 해시(60자)를 저장하므로 VARCHAR(255)
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS users (
  id            INT             NOT NULL AUTO_INCREMENT,
  email         VARCHAR(100)    NOT NULL,
  password      VARCHAR(255)    NOT NULL,
  nickname      VARCHAR(50)     NOT NULL,
  phone_number  VARCHAR(20)     NOT NULL,
  entry_year    INT             NOT NULL,
  student_id    VARCHAR(10)     NOT NULL,
  created_at    TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at    TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP
                                ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uk_users_email (email),
  UNIQUE KEY uk_users_phone_number (phone_number),
  UNIQUE KEY uk_users_entry_student (entry_year, student_id),
  CONSTRAINT chk_users_entry_year CHECK (entry_year BETWEEN 1980 AND 2100)
) ENGINE=InnoDB
  DEFAULT CHARSET=utf8mb4
  COLLATE=utf8mb4_0900_ai_ci;

-- ------------------------------------------------------------
-- 2. 상품 (products)
--    - type: SELL(판매) / FREE(무료나눔)
--    - status: SELLING(판매중) / RESERVED(예약중) / COMPLETED(거래완료)
--    - 회원 탈퇴 시 해당 회원의 상품도 함께 삭제 (ON DELETE CASCADE)
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS products (
  id            INT             NOT NULL AUTO_INCREMENT,
  user_id       INT             NOT NULL,
  title         VARCHAR(150)    NOT NULL,
  description   TEXT            NOT NULL,
  price         INT             NOT NULL DEFAULT 0,
  type          ENUM('SELL', 'FREE')                    NOT NULL DEFAULT 'SELL',
  category      ENUM('서적', '교복', '학용품', '기타')   NOT NULL,
  status        ENUM('SELLING', 'RESERVED', 'COMPLETED') NOT NULL DEFAULT 'SELLING',
  location      VARCHAR(100)    NOT NULL,
  image_url     VARCHAR(255)    NULL,
  created_at    TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at    TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP
                                ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  KEY idx_products_user (user_id),
  KEY idx_products_category_created (category, created_at),
  CONSTRAINT fk_products_user
    FOREIGN KEY (user_id) REFERENCES users (id)
    ON DELETE CASCADE,
  CONSTRAINT chk_products_price CHECK (price >= 0)
) ENGINE=InnoDB
  DEFAULT CHARSET=utf8mb4
  COLLATE=utf8mb4_0900_ai_ci;
