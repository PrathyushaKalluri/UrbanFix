-- UrbanFix Database Seed Script
-- ==========================================
-- This script is automatically executed by PostgreSQL on first container startup
-- when mounted into /docker-entrypoint-initdb.d/
--
-- Run order: This file is prefixed with '01_' so it executes after any schema
-- init scripts (00_schema.sql if present) but before application-specific scripts.
--
-- Tables are cleared and re-seeded in dependency order to respect foreign keys.

-- 0. Clear existing data and reset identity counters
-- --------------------------------------------------
TRUNCATE TABLE message_receipts,
               messages,
               conversation_participants,
               conversations,
               expert_expertise,
               expert_profiles,
               users
               RESTART IDENTITY CASCADE;

-- 1. Users
-- --------------------------------------------------
INSERT INTO public.users (id, email, full_name, "password", "role") VALUES
	 (8,'kedar@gmail.com','Kedar Dalvi','$2a$10$MaiBz8m8fbcyyAYeEOYc7ul8GQkuPcINAIe9oeM5Jc.VoRov6uqFy','USER'),
	 (11,'expert001@urbanfix.in','Expert 001','$2a$10$G7RXyrabrDeGEx9gD2TDPeokIVbv0FRDBrnd2CpRw26.TnMw3xiMi','EXPERT'),
	 (12,'expert002@urbanfix.in','Expert 002','$2a$10$G7RXyrabrDeGEx9gD2TDPeokIVbv0FRDBrnd2CpRw26.TnMw3xiMi','EXPERT'),
	 (13,'expert003@urbanfix.in','Expert 003','$2a$10$G7RXyrabrDeGEx9gD2TDPeokIVbv0FRDBrnd2CpRw26.TnMw3xiMi','EXPERT'),
	 (14,'expert004@urbanfix.in','Expert 004','$2a$10$G7RXyrabrDeGEx9gD2TDPeokIVbv0FRDBrnd2CpRw26.TnMw3xiMi','EXPERT'),
	 (15,'expert005@urbanfix.in','Expert 005','$2a$10$G7RXyrabrDeGEx9gD2TDPeokIVbv0FRDBrnd2CpRw26.TnMw3xiMi','EXPERT'),
	 (16,'expert006@urbanfix.in','Expert 006','$2a$10$G7RXyrabrDeGEx9gD2TDPeokIVbv0FRDBrnd2CpRw26.TnMw3xiMi','EXPERT'),
	 (17,'expert007@urbanfix.in','Expert 007','$2a$10$G7RXyrabrDeGEx9gD2TDPeokIVbv0FRDBrnd2CpRw26.TnMw3xiMi','EXPERT'),
	 (18,'expert008@urbanfix.in','Expert 008','$2a$10$G7RXyrabrDeGEx9gD2TDPeokIVbv0FRDBrnd2CpRw26.TnMw3xiMi','EXPERT'),
	 (19,'expert009@urbanfix.in','Expert 009','$2a$10$G7RXyrabrDeGEx9gD2TDPeokIVbv0FRDBrnd2CpRw26.TnMw3xiMi','EXPERT');
INSERT INTO public.users (id, email, full_name, "password", "role") VALUES
	 (20,'expert010@urbanfix.in','Expert 010','$2a$10$G7RXyrabrDeGEx9gD2TDPeokIVbv0FRDBrnd2CpRw26.TnMw3xiMi','EXPERT'),
	 (21,'expert011@urbanfix.in','Expert 011','$2a$10$G7RXyrabrDeGEx9gD2TDPeokIVbv0FRDBrnd2CpRw26.TnMw3xiMi','EXPERT'),
	 (22,'expert012@urbanfix.in','Expert 012','$2a$10$G7RXyrabrDeGEx9gD2TDPeokIVbv0FRDBrnd2CpRw26.TnMw3xiMi','EXPERT'),
	 (23,'expert013@urbanfix.in','Expert 013','$2a$10$G7RXyrabrDeGEx9gD2TDPeokIVbv0FRDBrnd2CpRw26.TnMw3xiMi','EXPERT'),
	 (24,'expert014@urbanfix.in','Expert 014','$2a$10$G7RXyrabrDeGEx9gD2TDPeokIVbv0FRDBrnd2CpRw26.TnMw3xiMi','EXPERT'),
	 (25,'expert015@urbanfix.in','Expert 015','$2a$10$G7RXyrabrDeGEx9gD2TDPeokIVbv0FRDBrnd2CpRw26.TnMw3xiMi','EXPERT'),
	 (26,'expert016@urbanfix.in','Expert 016','$2a$10$G7RXyrabrDeGEx9gD2TDPeokIVbv0FRDBrnd2CpRw26.TnMw3xiMi','EXPERT'),
	 (27,'expert017@urbanfix.in','Expert 017','$2a$10$G7RXyrabrDeGEx9gD2TDPeokIVbv0FRDBrnd2CpRw26.TnMw3xiMi','EXPERT'),
	 (28,'expert018@urbanfix.in','Expert 018','$2a$10$G7RXyrabrDeGEx9gD2TDPeokIVbv0FRDBrnd2CpRw26.TnMw3xiMi','EXPERT'),
	 (29,'expert019@urbanfix.in','Expert 019','$2a$10$G7RXyrabrDeGEx9gD2TDPeokIVbv0FRDBrnd2CpRw26.TnMw3xiMi','EXPERT');
INSERT INTO public.users (id, email, full_name, "password", "role") VALUES
	 (30,'expert020@urbanfix.in','Expert 020','$2a$10$G7RXyrabrDeGEx9gD2TDPeokIVbv0FRDBrnd2CpRw26.TnMw3xiMi','EXPERT'),
	 (31,'expert021@urbanfix.in','Expert 021','$2a$10$G7RXyrabrDeGEx9gD2TDPeokIVbv0FRDBrnd2CpRw26.TnMw3xiMi','EXPERT'),
	 (32,'expert022@urbanfix.in','Expert 022','$2a$10$G7RXyrabrDeGEx9gD2TDPeokIVbv0FRDBrnd2CpRw26.TnMw3xiMi','EXPERT'),
	 (33,'expert023@urbanfix.in','Expert 023','$2a$10$G7RXyrabrDeGEx9gD2TDPeokIVbv0FRDBrnd2CpRw26.TnMw3xiMi','EXPERT'),
	 (34,'expert024@urbanfix.in','Expert 024','$2a$10$G7RXyrabrDeGEx9gD2TDPeokIVbv0FRDBrnd2CpRw26.TnMw3xiMi','EXPERT'),
	 (35,'expert025@urbanfix.in','Expert 025','$2a$10$G7RXyrabrDeGEx9gD2TDPeokIVbv0FRDBrnd2CpRw26.TnMw3xiMi','EXPERT'),
	 (36,'expert026@urbanfix.in','Expert 026','$2a$10$G7RXyrabrDeGEx9gD2TDPeokIVbv0FRDBrnd2CpRw26.TnMw3xiMi','EXPERT'),
	 (37,'expert027@urbanfix.in','Expert 027','$2a$10$G7RXyrabrDeGEx9gD2TDPeokIVbv0FRDBrnd2CpRw26.TnMw3xiMi','EXPERT'),
	 (38,'expert028@urbanfix.in','Expert 028','$2a$10$G7RXyrabrDeGEx9gD2TDPeokIVbv0FRDBrnd2CpRw26.TnMw3xiMi','EXPERT'),
	 (39,'expert029@urbanfix.in','Expert 029','$2a$10$G7RXyrabrDeGEx9gD2TDPeokIVbv0FRDBrnd2CpRw26.TnMw3xiMi','EXPERT');
INSERT INTO public.users (id, email, full_name, "password", "role") VALUES
	 (40,'expert030@urbanfix.in','Expert 030','$2a$10$G7RXyrabrDeGEx9gD2TDPeokIVbv0FRDBrnd2CpRw26.TnMw3xiMi','EXPERT'),
	 (41,'expert031@urbanfix.in','Expert 031','$2a$10$G7RXyrabrDeGEx9gD2TDPeokIVbv0FRDBrnd2CpRw26.TnMw3xiMi','EXPERT'),
	 (42,'expert032@urbanfix.in','Expert 032','$2a$10$G7RXyrabrDeGEx9gD2TDPeokIVbv0FRDBrnd2CpRw26.TnMw3xiMi','EXPERT'),
	 (43,'expert033@urbanfix.in','Expert 033','$2a$10$G7RXyrabrDeGEx9gD2TDPeokIVbv0FRDBrnd2CpRw26.TnMw3xiMi','EXPERT'),
	 (44,'expert034@urbanfix.in','Expert 034','$2a$10$G7RXyrabrDeGEx9gD2TDPeokIVbv0FRDBrnd2CpRw26.TnMw3xiMi','EXPERT'),
	 (45,'expert035@urbanfix.in','Expert 035','$2a$10$G7RXyrabrDeGEx9gD2TDPeokIVbv0FRDBrnd2CpRw26.TnMw3xiMi','EXPERT'),
	 (46,'expert036@urbanfix.in','Expert 036','$2a$10$G7RXyrabrDeGEx9gD2TDPeokIVbv0FRDBrnd2CpRw26.TnMw3xiMi','EXPERT'),
	 (47,'expert037@urbanfix.in','Expert 037','$2a$10$G7RXyrabrDeGEx9gD2TDPeokIVbv0FRDBrnd2CpRw26.TnMw3xiMi','EXPERT'),
	 (48,'expert038@urbanfix.in','Expert 038','$2a$10$G7RXyrabrDeGEx9gD2TDPeokIVbv0FRDBrnd2CpRw26.TnMw3xiMi','EXPERT'),
	 (49,'expert039@urbanfix.in','Expert 039','$2a$10$G7RXyrabrDeGEx9gD2TDPeokIVbv0FRDBrnd2CpRw26.TnMw3xiMi','EXPERT');
INSERT INTO public.users (id, email, full_name, "password", "role") VALUES
	 (50,'expert040@urbanfix.in','Expert 040','$2a$10$G7RXyrabrDeGEx9gD2TDPeokIVbv0FRDBrnd2CpRw26.TnMw3xiMi','EXPERT'),
	 (51,'expert041@urbanfix.in','Expert 041','$2a$10$G7RXyrabrDeGEx9gD2TDPeokIVbv0FRDBrnd2CpRw26.TnMw3xiMi','EXPERT'),
	 (52,'expert042@urbanfix.in','Expert 042','$2a$10$G7RXyrabrDeGEx9gD2TDPeokIVbv0FRDBrnd2CpRw26.TnMw3xiMi','EXPERT'),
	 (53,'expert043@urbanfix.in','Expert 043','$2a$10$G7RXyrabrDeGEx9gD2TDPeokIVbv0FRDBrnd2CpRw26.TnMw3xiMi','EXPERT'),
	 (54,'expert044@urbanfix.in','Expert 044','$2a$10$G7RXyrabrDeGEx9gD2TDPeokIVbv0FRDBrnd2CpRw26.TnMw3xiMi','EXPERT'),
	 (55,'expert045@urbanfix.in','Expert 045','$2a$10$G7RXyrabrDeGEx9gD2TDPeokIVbv0FRDBrnd2CpRw26.TnMw3xiMi','EXPERT'),
	 (56,'expert046@urbanfix.in','Expert 046','$2a$10$G7RXyrabrDeGEx9gD2TDPeokIVbv0FRDBrnd2CpRw26.TnMw3xiMi','EXPERT'),
	 (57,'expert047@urbanfix.in','Expert 047','$2a$10$G7RXyrabrDeGEx9gD2TDPeokIVbv0FRDBrnd2CpRw26.TnMw3xiMi','EXPERT'),
	 (58,'expert048@urbanfix.in','Expert 048','$2a$10$G7RXyrabrDeGEx9gD2TDPeokIVbv0FRDBrnd2CpRw26.TnMw3xiMi','EXPERT'),
	 (59,'expert049@urbanfix.in','Expert 049','$2a$10$G7RXyrabrDeGEx9gD2TDPeokIVbv0FRDBrnd2CpRw26.TnMw3xiMi','EXPERT');
INSERT INTO public.users (id, email, full_name, "password", "role") VALUES
	 (60,'expert050@urbanfix.in','Expert 050','$2a$10$G7RXyrabrDeGEx9gD2TDPeokIVbv0FRDBrnd2CpRw26.TnMw3xiMi','EXPERT'),
	 (61,'expert051@urbanfix.in','Expert 051','$2a$10$G7RXyrabrDeGEx9gD2TDPeokIVbv0FRDBrnd2CpRw26.TnMw3xiMi','EXPERT'),
	 (62,'expert052@urbanfix.in','Expert 052','$2a$10$G7RXyrabrDeGEx9gD2TDPeokIVbv0FRDBrnd2CpRw26.TnMw3xiMi','EXPERT'),
	 (63,'expert053@urbanfix.in','Expert 053','$2a$10$G7RXyrabrDeGEx9gD2TDPeokIVbv0FRDBrnd2CpRw26.TnMw3xiMi','EXPERT'),
	 (64,'expert054@urbanfix.in','Expert 054','$2a$10$G7RXyrabrDeGEx9gD2TDPeokIVbv0FRDBrnd2CpRw26.TnMw3xiMi','EXPERT'),
	 (65,'expert055@urbanfix.in','Expert 055','$2a$10$G7RXyrabrDeGEx9gD2TDPeokIVbv0FRDBrnd2CpRw26.TnMw3xiMi','EXPERT'),
	 (66,'expert056@urbanfix.in','Expert 056','$2a$10$G7RXyrabrDeGEx9gD2TDPeokIVbv0FRDBrnd2CpRw26.TnMw3xiMi','EXPERT'),
	 (67,'expert057@urbanfix.in','Expert 057','$2a$10$G7RXyrabrDeGEx9gD2TDPeokIVbv0FRDBrnd2CpRw26.TnMw3xiMi','EXPERT'),
	 (68,'expert058@urbanfix.in','Expert 058','$2a$10$G7RXyrabrDeGEx9gD2TDPeokIVbv0FRDBrnd2CpRw26.TnMw3xiMi','EXPERT'),
	 (69,'expert059@urbanfix.in','Expert 059','$2a$10$G7RXyrabrDeGEx9gD2TDPeokIVbv0FRDBrnd2CpRw26.TnMw3xiMi','EXPERT');
INSERT INTO public.users (id, email, full_name, "password", "role") VALUES
	 (70,'expert060@urbanfix.in','Expert 060','$2a$10$G7RXyrabrDeGEx9gD2TDPeokIVbv0FRDBrnd2CpRw26.TnMw3xiMi','EXPERT'),
	 (71,'expert061@urbanfix.in','Expert 061','$2a$10$G7RXyrabrDeGEx9gD2TDPeokIVbv0FRDBrnd2CpRw26.TnMw3xiMi','EXPERT'),
	 (72,'expert062@urbanfix.in','Expert 062','$2a$10$G7RXyrabrDeGEx9gD2TDPeokIVbv0FRDBrnd2CpRw26.TnMw3xiMi','EXPERT'),
	 (73,'expert063@urbanfix.in','Expert 063','$2a$10$G7RXyrabrDeGEx9gD2TDPeokIVbv0FRDBrnd2CpRw26.TnMw3xiMi','EXPERT'),
	 (74,'expert064@urbanfix.in','Expert 064','$2a$10$G7RXyrabrDeGEx9gD2TDPeokIVbv0FRDBrnd2CpRw26.TnMw3xiMi','EXPERT'),
	 (75,'expert065@urbanfix.in','Expert 065','$2a$10$G7RXyrabrDeGEx9gD2TDPeokIVbv0FRDBrnd2CpRw26.TnMw3xiMi','EXPERT'),
	 (76,'expert066@urbanfix.in','Expert 066','$2a$10$G7RXyrabrDeGEx9gD2TDPeokIVbv0FRDBrnd2CpRw26.TnMw3xiMi','EXPERT'),
	 (77,'expert067@urbanfix.in','Expert 067','$2a$10$G7RXyrabrDeGEx9gD2TDPeokIVbv0FRDBrnd2CpRw26.TnMw3xiMi','EXPERT'),
	 (78,'expert068@urbanfix.in','Expert 068','$2a$10$G7RXyrabrDeGEx9gD2TDPeokIVbv0FRDBrnd2CpRw26.TnMw3xiMi','EXPERT'),
	 (79,'expert069@urbanfix.in','Expert 069','$2a$10$G7RXyrabrDeGEx9gD2TDPeokIVbv0FRDBrnd2CpRw26.TnMw3xiMi','EXPERT');
INSERT INTO public.users (id, email, full_name, "password", "role") VALUES
	 (80,'expert070@urbanfix.in','Expert 070','$2a$10$G7RXyrabrDeGEx9gD2TDPeokIVbv0FRDBrnd2CpRw26.TnMw3xiMi','EXPERT'),
	 (81,'expert071@urbanfix.in','Expert 071','$2a$10$G7RXyrabrDeGEx9gD2TDPeokIVbv0FRDBrnd2CpRw26.TnMw3xiMi','EXPERT'),
	 (82,'expert072@urbanfix.in','Expert 072','$2a$10$G7RXyrabrDeGEx9gD2TDPeokIVbv0FRDBrnd2CpRw26.TnMw3xiMi','EXPERT'),
	 (83,'expert073@urbanfix.in','Expert 073','$2a$10$G7RXyrabrDeGEx9gD2TDPeokIVbv0FRDBrnd2CpRw26.TnMw3xiMi','EXPERT'),
	 (84,'expert074@urbanfix.in','Expert 074','$2a$10$G7RXyrabrDeGEx9gD2TDPeokIVbv0FRDBrnd2CpRw26.TnMw3xiMi','EXPERT'),
	 (85,'expert075@urbanfix.in','Expert 075','$2a$10$G7RXyrabrDeGEx9gD2TDPeokIVbv0FRDBrnd2CpRw26.TnMw3xiMi','EXPERT'),
	 (86,'expert076@urbanfix.in','Expert 076','$2a$10$G7RXyrabrDeGEx9gD2TDPeokIVbv0FRDBrnd2CpRw26.TnMw3xiMi','EXPERT'),
	 (87,'expert077@urbanfix.in','Expert 077','$2a$10$G7RXyrabrDeGEx9gD2TDPeokIVbv0FRDBrnd2CpRw26.TnMw3xiMi','EXPERT'),
	 (88,'expert078@urbanfix.in','Expert 078','$2a$10$G7RXyrabrDeGEx9gD2TDPeokIVbv0FRDBrnd2CpRw26.TnMw3xiMi','EXPERT'),
	 (89,'expert079@urbanfix.in','Expert 079','$2a$10$G7RXyrabrDeGEx9gD2TDPeokIVbv0FRDBrnd2CpRw26.TnMw3xiMi','EXPERT');
INSERT INTO public.users (id, email, full_name, "password", "role") VALUES
	 (90,'expert080@urbanfix.in','Expert 080','$2a$10$G7RXyrabrDeGEx9gD2TDPeokIVbv0FRDBrnd2CpRw26.TnMw3xiMi','EXPERT'),
	 (91,'expert081@urbanfix.in','Expert 081','$2a$10$G7RXyrabrDeGEx9gD2TDPeokIVbv0FRDBrnd2CpRw26.TnMw3xiMi','EXPERT'),
	 (92,'expert082@urbanfix.in','Expert 082','$2a$10$G7RXyrabrDeGEx9gD2TDPeokIVbv0FRDBrnd2CpRw26.TnMw3xiMi','EXPERT'),
	 (93,'expert083@urbanfix.in','Expert 083','$2a$10$G7RXyrabrDeGEx9gD2TDPeokIVbv0FRDBrnd2CpRw26.TnMw3xiMi','EXPERT'),
	 (94,'expert084@urbanfix.in','Expert 084','$2a$10$G7RXyrabrDeGEx9gD2TDPeokIVbv0FRDBrnd2CpRw26.TnMw3xiMi','EXPERT'),
	 (95,'expert085@urbanfix.in','Expert 085','$2a$10$G7RXyrabrDeGEx9gD2TDPeokIVbv0FRDBrnd2CpRw26.TnMw3xiMi','EXPERT'),
	 (96,'expert086@urbanfix.in','Expert 086','$2a$10$G7RXyrabrDeGEx9gD2TDPeokIVbv0FRDBrnd2CpRw26.TnMw3xiMi','EXPERT'),
	 (97,'expert087@urbanfix.in','Expert 087','$2a$10$G7RXyrabrDeGEx9gD2TDPeokIVbv0FRDBrnd2CpRw26.TnMw3xiMi','EXPERT'),
	 (98,'expert088@urbanfix.in','Expert 088','$2a$10$G7RXyrabrDeGEx9gD2TDPeokIVbv0FRDBrnd2CpRw26.TnMw3xiMi','EXPERT'),
	 (99,'expert089@urbanfix.in','Expert 089','$2a$10$G7RXyrabrDeGEx9gD2TDPeokIVbv0FRDBrnd2CpRw26.TnMw3xiMi','EXPERT');
INSERT INTO public.users (id, email, full_name, "password", "role") VALUES
	 (100,'expert090@urbanfix.in','Expert 090','$2a$10$G7RXyrabrDeGEx9gD2TDPeokIVbv0FRDBrnd2CpRw26.TnMw3xiMi','EXPERT'),
	 (101,'expert091@urbanfix.in','Expert 091','$2a$10$G7RXyrabrDeGEx9gD2TDPeokIVbv0FRDBrnd2CpRw26.TnMw3xiMi','EXPERT'),
	 (102,'expert092@urbanfix.in','Expert 092','$2a$10$G7RXyrabrDeGEx9gD2TDPeokIVbv0FRDBrnd2CpRw26.TnMw3xiMi','EXPERT'),
	 (103,'expert093@urbanfix.in','Expert 093','$2a$10$G7RXyrabrDeGEx9gD2TDPeokIVbv0FRDBrnd2CpRw26.TnMw3xiMi','EXPERT'),
	 (104,'expert094@urbanfix.in','Expert 094','$2a$10$G7RXyrabrDeGEx9gD2TDPeokIVbv0FRDBrnd2CpRw26.TnMw3xiMi','EXPERT'),
	 (105,'expert095@urbanfix.in','Expert 095','$2a$10$G7RXyrabrDeGEx9gD2TDPeokIVbv0FRDBrnd2CpRw26.TnMw3xiMi','EXPERT'),
	 (106,'expert096@urbanfix.in','Expert 096','$2a$10$G7RXyrabrDeGEx9gD2TDPeokIVbv0FRDBrnd2CpRw26.TnMw3xiMi','EXPERT'),
	 (107,'expert097@urbanfix.in','Expert 097','$2a$10$G7RXyrabrDeGEx9gD2TDPeokIVbv0FRDBrnd2CpRw26.TnMw3xiMi','EXPERT'),
	 (108,'expert098@urbanfix.in','Expert 098','$2a$10$G7RXyrabrDeGEx9gD2TDPeokIVbv0FRDBrnd2CpRw26.TnMw3xiMi','EXPERT'),
	 (109,'expert099@urbanfix.in','Expert 099','$2a$10$G7RXyrabrDeGEx9gD2TDPeokIVbv0FRDBrnd2CpRw26.TnMw3xiMi','EXPERT');
INSERT INTO public.users (id, email, full_name, "password", "role") VALUES
	 (110,'expert100@urbanfix.in','Expert 100','$2a$10$G7RXyrabrDeGEx9gD2TDPeokIVbv0FRDBrnd2CpRw26.TnMw3xiMi','EXPERT'),
	 (111,'user001@urbanfix.in','User 001','$2a$10$G7RXyrabrDeGEx9gD2TDPeokIVbv0FRDBrnd2CpRw26.TnMw3xiMi','USER'),
	 (112,'user002@urbanfix.in','User 002','$2a$10$G7RXyrabrDeGEx9gD2TDPeokIVbv0FRDBrnd2CpRw26.TnMw3xiMi','USER'),
	 (113,'user003@urbanfix.in','User 003','$2a$10$G7RXyrabrDeGEx9gD2TDPeokIVbv0FRDBrnd2CpRw26.TnMw3xiMi','USER'),
	 (114,'user004@urbanfix.in','User 004','$2a$10$G7RXyrabrDeGEx9gD2TDPeokIVbv0FRDBrnd2CpRw26.TnMw3xiMi','USER'),
	 (115,'user005@urbanfix.in','User 005','$2a$10$G7RXyrabrDeGEx9gD2TDPeokIVbv0FRDBrnd2CpRw26.TnMw3xiMi','USER'),
	 (116,'user006@urbanfix.in','User 006','$2a$10$G7RXyrabrDeGEx9gD2TDPeokIVbv0FRDBrnd2CpRw26.TnMw3xiMi','USER'),
	 (117,'user007@urbanfix.in','User 007','$2a$10$G7RXyrabrDeGEx9gD2TDPeokIVbv0FRDBrnd2CpRw26.TnMw3xiMi','USER'),
	 (118,'user008@urbanfix.in','User 008','$2a$10$G7RXyrabrDeGEx9gD2TDPeokIVbv0FRDBrnd2CpRw26.TnMw3xiMi','USER'),
	 (119,'user009@urbanfix.in','User 009','$2a$10$G7RXyrabrDeGEx9gD2TDPeokIVbv0FRDBrnd2CpRw26.TnMw3xiMi','USER');
INSERT INTO public.users (id, email, full_name, "password", "role") VALUES
	 (120,'user010@urbanfix.in','User 010','$2a$10$G7RXyrabrDeGEx9gD2TDPeokIVbv0FRDBrnd2CpRw26.TnMw3xiMi','USER'),
	 (121,'user011@urbanfix.in','User 011','$2a$10$G7RXyrabrDeGEx9gD2TDPeokIVbv0FRDBrnd2CpRw26.TnMw3xiMi','USER'),
	 (122,'user012@urbanfix.in','User 012','$2a$10$G7RXyrabrDeGEx9gD2TDPeokIVbv0FRDBrnd2CpRw26.TnMw3xiMi','USER'),
	 (123,'user013@urbanfix.in','User 013','$2a$10$G7RXyrabrDeGEx9gD2TDPeokIVbv0FRDBrnd2CpRw26.TnMw3xiMi','USER'),
	 (124,'user014@urbanfix.in','User 014','$2a$10$G7RXyrabrDeGEx9gD2TDPeokIVbv0FRDBrnd2CpRw26.TnMw3xiMi','USER'),
	 (125,'user015@urbanfix.in','User 015','$2a$10$G7RXyrabrDeGEx9gD2TDPeokIVbv0FRDBrnd2CpRw26.TnMw3xiMi','USER'),
	 (126,'kedar123@gmail.com','Kedar','$2a$10$PIzaoKYfeIehX74iuRH8KuLAPGK5aTv/P.lrwA6Eu74sZm3p4ErO.','EXPERT'),
	 (127,'kedar123@gcomasdf.com','Kedar','$2a$10$/./m/yem5l7wZxXvn1os1uc1yc7p./oVxg4smsPZIA4eDo7agdAbu','EXPERT');

-- 2. Expert Profiles
-- --------------------------------------------------
INSERT INTO public.expert_profiles (id, available, primary_expertise, years_of_experience, user_id, latitude, longitude, service_area) VALUES
	 (61,true,'Plumbing',6,101,17.4483,78.3915,'Madhapur'),
	 (62,true,'Electrical',8,102,17.4401,78.3489,'Gachibowli'),
	 (63,false,'Carpentry',5,103,17.4435,78.3772,'Hitech City'),
	 (64,true,'HVAC',7,104,17.4933,78.4011,'Kukatpally'),
	 (65,true,'Locksmith',4,105,17.4374,78.4482,'Ameerpet'),
	 (66,false,'Painting',9,106,17.4138,78.4398,'Banjara Hills'),
	 (67,true,'Handyman',3,107,17.4326,78.4071,'Jubilee Hills'),
	 (68,true,'Plumbing',10,108,17.444,78.4627,'Begumpet'),
	 (70,false,'Carpentry',8,110,17.4399,78.4983,'Secunderabad'),
	 (71,true,'Plumbing',6,11,17.3457,78.5522,'LB Nagar');
INSERT INTO public.expert_profiles (id, available, primary_expertise, years_of_experience, user_id, latitude, longitude, service_area) VALUES
	 (72,true,'Electrical',8,12,17.4062,78.5591,'Uppal'),
	 (73,false,'Carpentry',5,13,17.3959,78.4331,'Mehdipatnam'),
	 (74,true,'HVAC',7,14,17.4483,78.3915,'Madhapur'),
	 (75,true,'Locksmith',4,15,17.4401,78.3489,'Gachibowli'),
	 (76,false,'Painting',9,16,17.4435,78.3772,'Hitech City'),
	 (77,true,'Handyman',3,17,17.4933,78.4011,'Kukatpally'),
	 (78,true,'Plumbing',10,18,17.4374,78.4482,'Ameerpet'),
	 (79,true,'Electrical',6,19,17.4138,78.4398,'Banjara Hills'),
	 (80,false,'Carpentry',8,20,17.4326,78.4071,'Jubilee Hills'),
	 (81,true,'Plumbing',7,21,17.444,78.4627,'Begumpet');
INSERT INTO public.expert_profiles (id, available, primary_expertise, years_of_experience, user_id, latitude, longitude, service_area) VALUES
	 (82,false,'Electrical',9,22,17.4399,78.4983,'Secunderabad'),
	 (83,true,'Carpentry',6,23,17.3457,78.5522,'LB Nagar'),
	 (84,true,'HVAC',8,24,17.4062,78.5591,'Uppal'),
	 (85,false,'Locksmith',5,25,17.3959,78.4331,'Mehdipatnam'),
	 (86,true,'Painting',10,26,17.4483,78.3915,'Madhapur'),
	 (87,true,'Handyman',4,27,17.4401,78.3489,'Gachibowli'),
	 (88,false,'Plumbing',11,28,17.4435,78.3772,'Hitech City'),
	 (89,true,'Electrical',12,29,17.4933,78.4011,'Kukatpally'),
	 (91,true,'HVAC',9,31,17.4374,78.4482,'Ameerpet'),
	 (92,false,'Locksmith',3,32,17.4138,78.4398,'Banjara Hills');
INSERT INTO public.expert_profiles (id, available, primary_expertise, years_of_experience, user_id, latitude, longitude, service_area) VALUES
	 (93,true,'Painting',11,33,17.4326,78.4071,'Jubilee Hills'),
	 (94,true,'Handyman',2,34,17.444,78.4627,'Begumpet'),
	 (95,true,'Plumbing',8,35,17.4399,78.4983,'Secunderabad'),
	 (96,false,'Electrical',7,36,17.3457,78.5522,'LB Nagar'),
	 (97,true,'Carpentry',5,37,17.4062,78.5591,'Uppal'),
	 (98,true,'HVAC',10,38,17.3959,78.4331,'Mehdipatnam'),
	 (99,false,'Locksmith',9,39,17.4483,78.3915,'Madhapur'),
	 (100,true,'Painting',6,40,17.4401,78.3489,'Gachibowli'),
	 (101,true,'Plumbing',7,41,17.4435,78.3772,'Hitech City'),
	 (102,true,'Electrical',6,42,17.4933,78.4011,'Kukatpally');
INSERT INTO public.expert_profiles (id, available, primary_expertise, years_of_experience, user_id, latitude, longitude, service_area) VALUES
	 (103,false,'Carpentry',4,43,17.4374,78.4482,'Ameerpet'),
	 (104,true,'HVAC',9,44,17.4138,78.4398,'Banjara Hills'),
	 (105,true,'Locksmith',5,45,17.4326,78.4071,'Jubilee Hills'),
	 (106,false,'Painting',8,46,17.444,78.4627,'Begumpet'),
	 (107,true,'Handyman',3,47,17.4399,78.4983,'Secunderabad'),
	 (108,true,'Plumbing',11,48,17.3457,78.5522,'LB Nagar'),
	 (109,true,'Electrical',10,49,17.4062,78.5591,'Uppal'),
	 (110,false,'Carpentry',7,50,17.3959,78.4331,'Mehdipatnam'),
	 (111,true,'HVAC',8,51,17.4483,78.3915,'Madhapur'),
	 (112,false,'Locksmith',4,52,17.4401,78.3489,'Gachibowli');
INSERT INTO public.expert_profiles (id, available, primary_expertise, years_of_experience, user_id, latitude, longitude, service_area) VALUES
	 (113,true,'Painting',9,53,17.4435,78.3772,'Hitech City'),
	 (114,true,'Handyman',2,54,17.4933,78.4011,'Kukatpally'),
	 (115,true,'Plumbing',12,55,17.4374,78.4482,'Ameerpet'),
	 (116,false,'Electrical',11,56,17.4138,78.4398,'Banjara Hills'),
	 (117,true,'Carpentry',6,57,17.4326,78.4071,'Jubilee Hills'),
	 (118,true,'HVAC',10,58,17.444,78.4627,'Begumpet'),
	 (119,false,'Locksmith',9,59,17.4399,78.4983,'Secunderabad'),
	 (120,true,'Painting',7,60,17.3457,78.5522,'LB Nagar'),
	 (121,true,'Plumbing',6,61,17.4062,78.5591,'Uppal'),
	 (122,true,'Electrical',8,62,17.3959,78.4331,'Mehdipatnam');
INSERT INTO public.expert_profiles (id, available, primary_expertise, years_of_experience, user_id, latitude, longitude, service_area) VALUES
	 (123,false,'Carpentry',5,63,17.4483,78.3915,'Madhapur'),
	 (124,true,'HVAC',7,64,17.4401,78.3489,'Gachibowli'),
	 (125,true,'Locksmith',4,65,17.4435,78.3772,'Hitech City'),
	 (126,false,'Painting',9,66,17.4933,78.4011,'Kukatpally'),
	 (127,true,'Handyman',3,67,17.4374,78.4482,'Ameerpet'),
	 (128,true,'Plumbing',10,68,17.4138,78.4398,'Banjara Hills'),
	 (129,true,'Electrical',6,69,17.4326,78.4071,'Jubilee Hills'),
	 (130,false,'Carpentry',8,70,17.444,78.4627,'Begumpet'),
	 (131,true,'Plumbing',6,71,17.4399,78.4983,'Secunderabad'),
	 (132,false,'Electrical',9,72,17.3457,78.5522,'LB Nagar');
INSERT INTO public.expert_profiles (id, available, primary_expertise, years_of_experience, user_id, latitude, longitude, service_area) VALUES
	 (133,true,'Carpentry',5,73,17.4062,78.5591,'Uppal'),
	 (134,true,'HVAC',7,74,17.3959,78.4331,'Mehdipatnam'),
	 (135,false,'Locksmith',4,75,17.4483,78.3915,'Madhapur'),
	 (136,true,'Painting',8,76,17.4401,78.3489,'Gachibowli'),
	 (137,true,'Handyman',3,77,17.4435,78.3772,'Hitech City'),
	 (138,false,'Plumbing',10,78,17.4933,78.4011,'Kukatpally'),
	 (139,true,'Electrical',11,79,17.4374,78.4482,'Ameerpet'),
	 (140,true,'Carpentry',6,80,17.4138,78.4398,'Banjara Hills'),
	 (141,true,'HVAC',9,81,17.4326,78.4071,'Jubilee Hills'),
	 (142,false,'Locksmith',3,82,17.444,78.4627,'Begumpet');
INSERT INTO public.expert_profiles (id, available, primary_expertise, years_of_experience, user_id, latitude, longitude, service_area) VALUES
	 (143,true,'Painting',12,83,17.4399,78.4983,'Secunderabad'),
	 (144,true,'Handyman',2,84,17.3457,78.5522,'LB Nagar'),
	 (145,true,'Plumbing',8,85,17.4062,78.5591,'Uppal'),
	 (146,false,'Electrical',7,86,17.3959,78.4331,'Mehdipatnam'),
	 (147,true,'Carpentry',5,87,17.4483,78.3915,'Madhapur'),
	 (148,true,'HVAC',10,88,17.4401,78.3489,'Gachibowli'),
	 (149,false,'Locksmith',9,89,17.4435,78.3772,'Hitech City'),
	 (150,true,'Painting',6,90,17.4933,78.4011,'Kukatpally'),
	 (90,true,'Carpentry',7,30,17.4374,78.4482,'Ameerpet'),
	 (151,true,'Plumbing',7,91,17.4138,78.4398,'Banjara Hills');
INSERT INTO public.expert_profiles (id, available, primary_expertise, years_of_experience, user_id, latitude, longitude, service_area) VALUES
	 (152,true,'Electrical',6,92,17.4326,78.4071,'Jubilee Hills'),
	 (153,false,'Carpentry',4,93,17.444,78.4627,'Begumpet'),
	 (154,true,'HVAC',9,94,17.4399,78.4983,'Secunderabad'),
	 (155,true,'Locksmith',5,95,17.3457,78.5522,'LB Nagar'),
	 (156,false,'Painting',8,96,17.4062,78.5591,'Uppal'),
	 (157,true,'Handyman',3,97,17.3959,78.4331,'Mehdipatnam'),
	 (159,true,'Electrical',10,99,17.4401,78.3489,'Gachibowli'),
	 (160,false,'Carpentry',7,100,17.4435,78.3772,'Hitech City'),
	 (161,true,'Electrician',4,126,17.4933,78.4011,'Kukatpally'),
	 (69,true,'Electrical',6,109,17.44784016,78.34795696,'Gachibowli');
INSERT INTO public.expert_profiles (id, available, primary_expertise, years_of_experience, user_id, latitude, longitude, service_area) VALUES
	 (162,true,'Electrician',53,127,17.4138,78.4398,'Banjara Hills'),
	 (158,true,'Plumbing',11,98,17.4483,78.3915,'Madhapur');

-- 3. Expert Expertise
-- --------------------------------------------------
INSERT INTO public.expert_expertise (expert_profile_id, expertise) VALUES
	 (61,'Plumbing,Drainage,Pipe Repair'),
	 (62,'Electrical,Wiring,Appliance Repair'),
	 (63,'Carpentry,Furniture Repair,Woodwork'),
	 (64,'HVAC,AC Repair,Installation'),
	 (65,'Locksmith,Lock Repair,Security Systems'),
	 (66,'Painting,Interior Painting,Wall Finishing'),
	 (67,'Handyman,General Repairs,Maintenance'),
	 (68,'Plumbing,Emergency Repair,Leak Fixing'),
	 (69,'Electrical,Inspection,Circuit Repair'),
	 (70,'Carpentry,Modular Furniture,Installation');
INSERT INTO public.expert_expertise (expert_profile_id, expertise) VALUES
	 (71,'Plumbing,Pipeline,Drainage'),
	 (72,'Electrical,Industrial Wiring,Maintenance'),
	 (73,'Carpentry,Custom Furniture,Woodwork'),
	 (74,'HVAC,AC Maintenance,Cooling Systems'),
	 (75,'Locksmith,Emergency Unlock,Security'),
	 (76,'Painting,Decorative,Exterior Painting'),
	 (77,'Handyman,Minor Repairs,Home Fixes'),
	 (78,'Plumbing,Bathroom Fittings,Installation'),
	 (79,'Electrical,Certified Inspection,Repair'),
	 (80,'Carpentry,Office Furniture,Fittings');
INSERT INTO public.expert_expertise (expert_profile_id, expertise) VALUES
	 (81,'HVAC,Commercial Systems,Repair'),
	 (82,'Locksmith,Key Duplication,Lock Systems'),
	 (83,'Painting,Large Projects,Wall Design'),
	 (84,'Handyman,Quick Fix,General Maintenance'),
	 (85,'Plumbing,Pipeline Repair,Leak Detection'),
	 (86,'Electrical,Appliance Repair,Wiring'),
	 (87,'Carpentry,Wood Repair,Custom Work'),
	 (88,'HVAC,AC Installation,Maintenance'),
	 (89,'Locksmith,Security Locks,Installation'),
	 (90,'Painting,Interior Design,Wall Coating');
INSERT INTO public.expert_expertise (expert_profile_id, expertise) VALUES
	 (91,'Plumbing,Residential Repair,Installation'),
	 (92,'Electrical,Home Wiring,Repairs'),
	 (93,'Carpentry,Furniture Fixing,Woodwork'),
	 (94,'HVAC,System Repair,Cooling'),
	 (95,'Locksmith,Emergency Service,Unlock'),
	 (96,'Painting,Renovation,Wall Finishing'),
	 (97,'Handyman,General Service,Fixes'),
	 (98,'Plumbing,Emergency,Pipe Fix'),
	 (99,'Electrical,Technician,Circuit Repair'),
	 (100,'Carpentry,Interior Work,Wood Fix');
INSERT INTO public.expert_expertise (expert_profile_id, expertise) VALUES
	 (101,'HVAC,Repair,Maintenance'),
	 (102,'Locksmith,Home Locks,Security'),
	 (103,'Painting,Commercial,Wall Design'),
	 (104,'Handyman,Urgent Repairs,Home Service'),
	 (105,'Plumbing,Advanced Repair,Installation'),
	 (106,'Electrical,System Repair,Inspection'),
	 (107,'Carpentry,Custom Build,Furniture'),
	 (108,'HVAC,Maintenance,Cooling Systems'),
	 (109,'Locksmith,Security Systems,Locks'),
	 (110,'Painting,Interior Specialist,Decor');
INSERT INTO public.expert_expertise (expert_profile_id, expertise) VALUES
	 (111,'Plumbing,Installation,Repair'),
	 (112,'Electrical,Appliance Fix,Wiring'),
	 (113,'Carpentry,Wood Design,Furniture'),
	 (114,'HVAC,AC Service,Repair'),
	 (115,'Locksmith,Lock Fix,Security'),
	 (116,'Painting,Wall Painting,Interior'),
	 (117,'Handyman,Home Repairs,Fixing'),
	 (118,'Plumbing,Leak Repair,Drainage'),
	 (119,'Electrical,Inspection,Maintenance'),
	 (120,'Carpentry,Wood Repair,Fittings');
INSERT INTO public.expert_expertise (expert_profile_id, expertise) VALUES
	 (121,'HVAC,AC Installation,Maintenance'),
	 (122,'Locksmith,Emergency Unlock,Repair'),
	 (123,'Painting,Decorative Work,Wall Design'),
	 (124,'Handyman,Quick Service,Repairs'),
	 (125,'Plumbing,Pipeline Work,Fixing'),
	 (126,'Electrical,Wiring,System Repair'),
	 (127,'Carpentry,Custom Work,Wood Fix'),
	 (128,'HVAC,Cooling Systems,Repair'),
	 (129,'Locksmith,Security Setup,Locks'),
	 (130,'Painting,Interior Work,Finishing');
INSERT INTO public.expert_expertise (expert_profile_id, expertise) VALUES
	 (131,'Plumbing,Drainage Repair,Leak Fix'),
	 (132,'Electrical,Home Setup,Wiring'),
	 (133,'Carpentry,Furniture Build,Repair'),
	 (134,'HVAC,AC Installation,Service'),
	 (135,'Locksmith,Lock Installation,Security'),
	 (136,'Painting,Wall Coating,Interior'),
	 (137,'Handyman,General Fixes,Maintenance'),
	 (138,'Plumbing,Emergency Repair,Pipeline'),
	 (139,'Electrical,Inspection,Circuit Fix'),
	 (140,'Carpentry,Woodwork,Installation');
INSERT INTO public.expert_expertise (expert_profile_id, expertise) VALUES
	 (141,'HVAC,Maintenance,Repair'),
	 (142,'Locksmith,Unlock Services,Security'),
	 (143,'Painting,Commercial Work,Design'),
	 (144,'Handyman,Home Fix,Repairs'),
	 (145,'Plumbing,Pipeline Fix,Leak Detection'),
	 (146,'Electrical,Appliance Repair,System'),
	 (147,'Carpentry,Wood Repair,Custom'),
	 (148,'HVAC,AC Service,Installation'),
	 (149,'Locksmith,Security Locks,Repair'),
	 (150,'Painting,Decorative Walls,Interior');
INSERT INTO public.expert_expertise (expert_profile_id, expertise) VALUES
	 (151,'Plumbing,Installation,Drainage'),
	 (152,'Electrical,Wiring,Inspection'),
	 (153,'Carpentry,Furniture Fix,Woodwork'),
	 (154,'HVAC,Repair,Cooling Systems'),
	 (155,'Locksmith,Emergency Lock,Service'),
	 (156,'Painting,Renovation,Interior'),
	 (157,'Handyman,Fixes,General Service'),
	 (158,'Plumbing,Leak Fix,Repair'),
	 (159,'Electrical,Technician,System Fix'),
	 (160,'Carpentry,Wood Setup,Repair');
INSERT INTO public.expert_expertise (expert_profile_id, expertise) VALUES
	 (61,'true'),
	 (62,'true'),
	 (63,'false'),
	 (64,'true'),
	 (65,'true'),
	 (66,'false'),
	 (67,'true'),
	 (68,'true'),
	 (70,'false'),
	 (71,'true');
INSERT INTO public.expert_expertise (expert_profile_id, expertise) VALUES
	 (72,'true'),
	 (73,'false'),
	 (74,'true'),
	 (75,'true'),
	 (76,'false'),
	 (77,'true'),
	 (78,'true'),
	 (79,'true'),
	 (80,'false'),
	 (81,'true');
INSERT INTO public.expert_expertise (expert_profile_id, expertise) VALUES
	 (82,'false'),
	 (83,'true'),
	 (84,'true'),
	 (85,'false'),
	 (86,'true'),
	 (87,'true'),
	 (88,'false'),
	 (89,'true'),
	 (91,'true'),
	 (92,'false');
INSERT INTO public.expert_expertise (expert_profile_id, expertise) VALUES
	 (93,'true'),
	 (94,'true'),
	 (95,'true'),
	 (96,'false'),
	 (97,'true'),
	 (98,'true'),
	 (99,'false'),
	 (100,'true'),
	 (101,'true'),
	 (102,'true');
INSERT INTO public.expert_expertise (expert_profile_id, expertise) VALUES
	 (103,'false'),
	 (104,'true'),
	 (105,'true'),
	 (106,'false'),
	 (107,'true'),
	 (108,'true'),
	 (109,'true'),
	 (110,'false'),
	 (111,'true'),
	 (112,'false');
INSERT INTO public.expert_expertise (expert_profile_id, expertise) VALUES
	 (113,'true'),
	 (114,'true'),
	 (115,'true'),
	 (116,'false'),
	 (117,'true'),
	 (118,'true'),
	 (119,'false'),
	 (120,'true'),
	 (121,'true'),
	 (122,'true');
INSERT INTO public.expert_expertise (expert_profile_id, expertise) VALUES
	 (123,'false'),
	 (124,'true'),
	 (125,'true'),
	 (126,'false'),
	 (127,'true'),
	 (128,'true'),
	 (129,'true'),
	 (130,'false'),
	 (131,'true'),
	 (132,'false');
INSERT INTO public.expert_expertise (expert_profile_id, expertise) VALUES
	 (133,'true'),
	 (134,'true'),
	 (135,'false'),
	 (136,'true'),
	 (137,'true'),
	 (138,'false'),
	 (139,'true'),
	 (140,'true'),
	 (141,'true'),
	 (142,'false');
INSERT INTO public.expert_expertise (expert_profile_id, expertise) VALUES
	 (143,'true'),
	 (144,'true'),
	 (145,'true'),
	 (146,'false'),
	 (147,'true'),
	 (148,'true'),
	 (149,'false'),
	 (150,'true'),
	 (90,'true'),
	 (151,'true');
INSERT INTO public.expert_expertise (expert_profile_id, expertise) VALUES
	 (152,'true'),
	 (153,'false'),
	 (154,'true'),
	 (155,'true'),
	 (156,'false'),
	 (157,'true'),
	 (158,'true'),
	 (159,'true'),
	 (160,'false'),
	 (161,'true');
INSERT INTO public.expert_expertise (expert_profile_id, expertise) VALUES
	 (69,'true'),
	 (162,'true');

-- 4. Conversations
-- --------------------------------------------------
INSERT INTO public.conversations (conversation_key, created_at, created_by_user_id, last_message_at, updated_at) VALUES
	 ('8_158','2026-04-23 07:14:08.793711+05:30',8,'2026-04-23 07:14:14.434237+05:30','2026-04-23 07:14:14.434237+05:30'),
	 ('8_98','2026-04-23 07:27:03.375795+05:30',8,'2026-04-23 11:23:15.576884+05:30','2026-04-23 11:23:15.576884+05:30');

-- 5. Conversation Participants
-- --------------------------------------------------
INSERT INTO public.conversation_participants (is_active, joined_at, last_read_at, user_id, conversation_id) VALUES
	 (true,'2026-04-23 07:14:08.817423+05:30',NULL,158,1),
	 (true,'2026-04-23 07:14:08.812798+05:30','2026-04-23 08:29:38.501311+05:30',8,1),
	 (true,'2026-04-23 07:27:03.394812+05:30','2026-04-23 11:23:15.385511+05:30',8,2),
	 (true,'2026-04-23 07:27:03.396152+05:30','2026-04-23 13:16:16.26489+05:30',98,2);

-- 6. Messages
-- --------------------------------------------------
INSERT INTO public.messages (body, client_message_id, created_at, delivery_state, message_type, sender_user_id, updated_at, conversation_id) VALUES
	 ('hello','1-1776908654420-glenqw','2026-04-23 07:14:14.434237+05:30','SENT','TEXT',8,'2026-04-23 07:14:14.434237+05:30',1),
	 ('hello','2-1776909426995-9nimbh','2026-04-23 07:27:07.039376+05:30','SENT','TEXT',8,'2026-04-23 07:27:07.039376+05:30',2),
	 ('hello there','2-1776909466254-4eu29l','2026-04-23 07:27:46.262491+05:30','SENT','TEXT',98,'2026-04-23 07:27:46.262492+05:30',2),
	 ('hi','2-1776910755370-t0mxz7','2026-04-23 07:49:15.376292+05:30','SENT','TEXT',8,'2026-04-23 07:49:15.376292+05:30',2),
	 ('testing','2-1776910792734-krfcuq','2026-04-23 07:49:52.744607+05:30','SENT','TEXT',8,'2026-04-23 07:49:52.744607+05:30',2),
	 ('check','2-1776910798324-krert5','2026-04-23 07:49:58.33126+05:30','SENT','TEXT',98,'2026-04-23 07:49:58.33126+05:30',2),
	 ('testing','2-1776910845869-9oor34','2026-04-23 07:50:45.895457+05:30','SENT','TEXT',8,'2026-04-23 07:50:45.895458+05:30',2),
	 ('hi','2-1776910864246-2wbvdh','2026-04-23 07:51:04.257413+05:30','SENT','TEXT',98,'2026-04-23 07:51:04.257413+05:30',2),
	 ('test again','2-1776910892954-mueebg','2026-04-23 07:51:32.965583+05:30','SENT','TEXT',98,'2026-04-23 07:51:32.965583+05:30',2),
	 ('1','2-1776911482044-vcgfqg','2026-04-23 08:01:22.06631+05:30','SENT','TEXT',8,'2026-04-23 08:01:22.06631+05:30',2);
INSERT INTO public.messages (body, client_message_id, created_at, delivery_state, message_type, sender_user_id, updated_at, conversation_id) VALUES
	 ('2','2-1776911489553-vue6ls','2026-04-23 08:01:29.573803+05:30','SENT','TEXT',8,'2026-04-23 08:01:29.573803+05:30',2),
	 ('3','2-1776911572013-lt0hqz','2026-04-23 08:02:52.020741+05:30','SENT','TEXT',98,'2026-04-23 08:02:52.020741+05:30',2),
	 ('test','2-1776923592816-2azzo0','2026-04-23 11:23:12.8393+05:30','SENT','TEXT',98,'2026-04-23 11:23:12.8393+05:30',2),
	 ('test','2-1776923595568-hk8ml5','2026-04-23 11:23:15.576884+05:30','SENT','TEXT',8,'2026-04-23 11:23:15.576885+05:30',2);

-- 7. Message Receipts (Read Receipts)
-- --------------------------------------------------
INSERT INTO public.message_receipts (delivered_at, read_at, recipient_user_id, message_id) VALUES
	 (NULL,NULL,158,1),
	 ('2026-04-23 07:27:48.494632+05:30','2026-04-23 07:27:48.494632+05:30',8,3),
	 ('2026-04-23 07:46:13.885627+05:30','2026-04-23 07:46:13.885627+05:30',98,2),
	 ('2026-04-23 07:49:59.505345+05:30','2026-04-23 07:49:59.505345+05:30',8,6),
	 ('2026-04-23 07:50:31.0014+05:30','2026-04-23 07:50:36.766688+05:30',98,4),
	 ('2026-04-23 07:50:31.008601+05:30','2026-04-23 07:50:36.768701+05:30',98,5),
	 ('2026-04-23 07:51:06.281708+05:30','2026-04-23 07:51:06.310079+05:30',8,8),
	 ('2026-04-23 07:51:33.670942+05:30','2026-04-23 07:51:33.708774+05:30',8,9),
	 ('2026-04-23 07:50:48.844647+05:30','2026-04-23 08:01:16.42053+05:30',98,7),
	 ('2026-04-23 08:01:22.489254+05:30','2026-04-23 08:01:22.514598+05:30',98,10);
INSERT INTO public.message_receipts (delivered_at, read_at, recipient_user_id, message_id) VALUES
	 ('2026-04-23 08:01:43.215441+05:30','2026-04-23 08:01:43.250245+05:30',98,11),
	 ('2026-04-23 08:02:54.963959+05:30','2026-04-23 08:02:54.987114+05:30',8,12),
	 ('2026-04-23 11:23:12.888614+05:30','2026-04-23 11:23:12.888614+05:30',8,13),
	 ('2026-04-23 11:23:15.607928+05:30','2026-04-23 11:23:15.607928+05:30',98,14);

-- 8. Reset sequences so Hibernate/JPA can insert new rows without ID conflicts
-- --------------------------------------------------
SELECT setval(pg_get_serial_sequence('users', 'id'), coalesce((SELECT MAX(id) FROM users), 1), true);
SELECT setval(pg_get_serial_sequence('expert_profiles', 'id'), coalesce((SELECT MAX(id) FROM expert_profiles), 1), true);
SELECT setval(pg_get_serial_sequence('conversations', 'id'), coalesce((SELECT MAX(id) FROM conversations), 1), true);
SELECT setval(pg_get_serial_sequence('messages', 'id'), coalesce((SELECT MAX(id) FROM messages), 1), true);
SELECT setval(pg_get_serial_sequence('message_attachments', 'id'), coalesce((SELECT MAX(id) FROM message_attachments), 1), true);
