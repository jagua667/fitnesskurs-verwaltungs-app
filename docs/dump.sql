--
-- PostgreSQL database dump
--

-- Dumped from database version 14.18 (Ubuntu 14.18-0ubuntu0.22.04.1)
-- Dumped by pg_dump version 14.18 (Ubuntu 14.18-0ubuntu0.22.04.1)

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: bookings; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.bookings (
    id integer NOT NULL,
    user_id integer,
    course_id integer,
    status character varying(20) DEFAULT 'booked'::character varying,
    booking_date timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT status_check CHECK (((status)::text = ANY ((ARRAY['booked'::character varying, 'cancelled'::character varying, 'attended'::character varying])::text[])))
);


ALTER TABLE public.bookings OWNER TO postgres;

--
-- Name: bookings_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.bookings_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.bookings_id_seq OWNER TO postgres;

--
-- Name: bookings_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.bookings_id_seq OWNED BY public.bookings.id;


--
-- Name: courses; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.courses (
    id integer NOT NULL,
    title character varying(255) NOT NULL,
    description text,
    start_time timestamp without time zone NOT NULL,
    end_time timestamp without time zone NOT NULL,
    location character varying(255),
    max_capacity integer,
    trainer_id integer,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    trainer_name text,
    repeat character varying(20) DEFAULT 'none'::character varying,
    repeat_until date
);


ALTER TABLE public.courses OWNER TO postgres;

--
-- Name: courses_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.courses_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.courses_id_seq OWNER TO postgres;

--
-- Name: courses_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.courses_id_seq OWNED BY public.courses.id;


--
-- Name: ratings; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.ratings (
    id integer NOT NULL,
    course_id integer,
    user_id integer,
    rating integer,
    comment text,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT ratings_rating_check CHECK (((rating >= 1) AND (rating <= 5)))
);


ALTER TABLE public.ratings OWNER TO postgres;

--
-- Name: ratings_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.ratings_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.ratings_id_seq OWNER TO postgres;

--
-- Name: ratings_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.ratings_id_seq OWNED BY public.ratings.id;


--
-- Name: reviews; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.reviews (
    id integer NOT NULL,
    user_id integer,
    course_id integer,
    rating integer,
    comment text,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT reviews_rating_check CHECK (((rating >= 1) AND (rating <= 5)))
);


ALTER TABLE public.reviews OWNER TO postgres;

--
-- Name: reviews_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.reviews_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.reviews_id_seq OWNER TO postgres;

--
-- Name: reviews_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.reviews_id_seq OWNED BY public.reviews.id;


--
-- Name: sessions; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.sessions (
    id uuid NOT NULL,
    user_id integer,
    last_active timestamp without time zone DEFAULT now()
);


ALTER TABLE public.sessions OWNER TO postgres;

--
-- Name: users; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.users (
    id integer NOT NULL,
    name character varying(255) NOT NULL,
    email character varying(255) NOT NULL,
    password character varying(255) NOT NULL,
    role character varying(50) DEFAULT 'Kunde'::character varying NOT NULL,
    locked boolean DEFAULT false
);


ALTER TABLE public.users OWNER TO postgres;

--
-- Name: users_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.users_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.users_id_seq OWNER TO postgres;

--
-- Name: users_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.users_id_seq OWNED BY public.users.id;


--
-- Name: bookings id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.bookings ALTER COLUMN id SET DEFAULT nextval('public.bookings_id_seq'::regclass);


--
-- Name: courses id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.courses ALTER COLUMN id SET DEFAULT nextval('public.courses_id_seq'::regclass);


--
-- Name: ratings id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.ratings ALTER COLUMN id SET DEFAULT nextval('public.ratings_id_seq'::regclass);


--
-- Name: reviews id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.reviews ALTER COLUMN id SET DEFAULT nextval('public.reviews_id_seq'::regclass);


--
-- Name: users id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users ALTER COLUMN id SET DEFAULT nextval('public.users_id_seq'::regclass);


--
-- Data for Name: bookings; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.bookings (id, user_id, course_id, status, booking_date, created_at, updated_at) FROM stdin;
6	2	6	booked	2025-04-10 17:37:23.323104	2025-04-10 17:37:23.323104	2025-04-10 17:37:23.323104
7	2	4	booked	2025-04-14 21:59:48.620592	2025-04-14 21:59:48.620592	2025-04-14 21:59:48.620592
10	7	5	booked	2025-04-14 23:23:15.258623	2025-04-14 23:23:15.258623	2025-04-14 23:23:15.258623
11	7	4	booked	2025-04-14 23:26:34.945588	2025-04-14 23:26:34.945588	2025-04-14 23:26:34.945588
14	9	7	booked	2025-04-15 11:51:49.605242	2025-04-15 11:51:49.605242	2025-04-15 11:51:49.605242
15	9	4	booked	2025-04-15 12:11:44.222288	2025-04-15 12:11:44.222288	2025-04-15 12:11:44.222288
20	10	8	booked	2025-04-15 17:28:26.156655	2025-04-15 17:28:26.156655	2025-04-15 17:28:26.156655
21	2	1	booked	2025-05-24 05:01:05.717738	2025-05-24 05:01:05.717738	2025-05-24 05:01:05.717738
1	2	5	booked	2025-04-10 16:53:32.113903	2025-04-10 16:53:32.113903	2025-04-10 16:53:32.113903
24	2	7	booked	2025-06-18 10:17:56.523472	2025-06-18 10:17:56.523472	2025-06-18 10:17:56.523472
\.


--
-- Data for Name: courses; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.courses (id, title, description, start_time, end_time, location, max_capacity, trainer_id, created_at, updated_at, trainer_name, repeat, repeat_until) FROM stdin;
8	Laufen für Anfänger	Ein entspannter Kurs für Einsteiger	2025-05-26 20:00:00	2025-05-26 21:30:00	Fitnow Tübingen	15	1	2025-04-15 15:04:28.032027	2025-04-15 15:04:28.032027	Vincent Kompany	weekly	2025-08-01
7	Pilates für Anfänger	Ein entspannter Kurs für Einsteiger	2025-04-15 12:00:00	2025-04-15 13:30:00	Fitnow Tübingen	15	1	2025-04-15 11:49:44.65159	2025-04-15 11:49:44.65159	Vincent Kompany	weekly	2025-08-01
11	Dance Workout – Latin Beats	Cardio-Workout mit Tanzbewegungen zu Salsa, Reggaeton und Merengue – Spaß garantiert!	2025-06-01 19:30:00	2025-06-01 20:30:00	Fitnow Berlin_Lichtenberg	15	1	2025-05-25 14:50:22.943115	2025-05-26 23:04:27.687892	Vincent Kompany	weekly	2025-08-01
12	Mobility & Stretching	Sanftes Ganzkörper-Programm zur Verbesserung der Beweglichkeit und zur Verletzungsprävention.	2025-06-05 18:00:00	2025-06-05 19:00:00	Fitnow Stuttgart	15	1	2025-05-25 14:50:22.943115	2025-05-26 23:08:03.878905	Vincent Kompany	weekly	2025-08-01
13	Functional HIIT	Kurzes, intensives Training für Kraft, Ausdauer und Fettverbrennung mit funktionellen Bewegungen.	2025-06-05 07:00:00	2025-06-05 07:45:00	Fitnow Böblingen	15	1	2025-05-25 14:50:22.943115	2025-05-26 23:08:38.058178	Vincent Kompany	weekly	2025-08-01
14	Rückenfit am Arbeitsplatz	Spezielles Training gegen Verspannungen durch Büroarbeit – ideal in der Mittagspause.	2025-06-05 12:15:00	2025-06-05 12:45:00	Fitnow Tübingen	15	1	2025-05-25 14:50:22.943115	2025-05-26 23:09:40.452387	Vincent Kompany	weekly	2025-08-01
17	Power Core – Bauch & Rücken	Effektives Training für eine starke Körpermitte – Fokus auf Rumpfstabilität, Bauch- und Rückenmuskulatur.	2025-06-05 17:30:00	2025-06-05 18:15:00	Fitnow Tübingen	15	1	2025-05-25 14:50:22.943115	2025-05-26 23:13:21.776578	Vincent Kompany	weekly	2025-08-01
1	Yoga Anfänger	Ein entspannter Einstieg	2025-04-16 17:30:00	2025-04-16 18:15:00	Fitnow Tübingen	20	1	2025-04-13 22:07:42.509434	2025-04-13 22:07:42.509434	Vincent Kompany	weekly	2025-07-01
6	Testkurs exklusiv	Nur 1 Platz verfügbar	2025-04-10 17:35:11.051718	2025-04-10 18:35:11.051718	Fitnow Böblingen	1	11	2025-04-10 17:35:11.051718	2025-04-10 17:35:11.051718	Ottmar Hitzfeld	weekly	2025-08-01
5	Yoga für Anfänger	Ein entspannter Kurs für Einsteiger	2025-04-15 10:00:00	2025-04-15 11:00:00	Fitnow Tübingen	15	11	2025-04-10 16:15:45.421988	2025-04-10 16:15:45.421988	Ottmar Hitzfeld	weekly	2025-08-01
4	Yoga Fortgeschrittene	Jetzt wird’s intensiv!	2025-04-15 12:00:00	2025-04-15 13:00:00	Fitnow Berlin_Lichtenberg	20	11	2025-04-10 14:35:35.42872	2025-04-10 14:44:31.043196	Ottmar Hitzfeld	weekly	2025-08-01
\.


--
-- Data for Name: ratings; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.ratings (id, course_id, user_id, rating, comment, created_at) FROM stdin;
5	11	2	5	Tolle Musik und super Stimmung – sehr motivierend!	2025-05-26 23:34:49.098528
6	12	7	4	Entspannend und hilfreich nach einem langen Tag.	2025-05-26 23:34:49.243709
7	13	9	5	Hart, aber effektiv – perfekter Start in den Morgen.	2025-05-26 23:34:49.254225
8	14	12	4	Sehr sinnvoll für den Büroalltag, kurz & knackig!	2025-05-26 23:34:49.265365
9	17	13	5	Top Kurs für die Rumpfmuskulatur – empfehlenswert.	2025-05-26 23:34:49.276339
10	7	10	5	Sehr gut erklärt und angenehm ruhig. Perfekt!	2025-05-26 23:34:49.287689
11	8	5	4	Guter Einstiegskurs für Laufanfänger.	2025-05-26 23:34:49.299898
12	1	7	5	Sehr entspannend, angenehme Atmosphäre.	2025-05-26 23:34:49.309722
13	6	12	3	Interessantes Format, aber etwas unorganisiert.	2025-05-26 23:34:49.320934
14	5	2	4	Sehr angenehmer Einstieg in Yoga.	2025-05-26 23:34:49.331576
15	4	13	5	Fordert gut – für Fortgeschrittene super geeignet!	2025-05-26 23:34:49.34277
18	7	2	4	Guter Kurs. Die Asanas könnten leicht fließender sein.	2025-05-29 04:00:36.564604
19	1	2	5	Sehr gut!	2025-06-06 03:23:18.511512
\.


--
-- Data for Name: reviews; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.reviews (id, user_id, course_id, rating, comment, created_at, updated_at) FROM stdin;
4	7	1	5	Sehr guter Kurs!	2025-05-22 15:17:02.117489	2025-05-22 15:17:02.117489
5	9	4	5	Top Trainer!	2025-05-22 15:17:02.117489	2025-05-22 15:17:02.117489
6	10	5	3	War okay.	2025-05-22 15:17:02.117489	2025-05-22 15:17:02.117489
\.


--
-- Data for Name: sessions; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.sessions (id, user_id, last_active) FROM stdin;
60cb652e-144d-4051-afc5-70cb4b2ea6e6	4	2025-06-06 03:31:42.823573
5e6870a6-de91-4abc-9de0-8b105678292e	1	2025-06-15 08:29:47.396166
e4d4c65d-a1ee-4268-857e-67a7b23975e8	2	2025-06-19 12:29:26.871516
\.


--
-- Data for Name: users; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.users (id, name, email, password, role, locked) FROM stdin;
12	Florian Koch	florian@test.com	$2b$10$7VxuivHrdfedAyys1RIhmuuL43gMpwkZfyCxUIN8gjt1DewUQuNpO	kunde	f
4	Admin User	admin@example.com	$2b$10$1bhYOWB9f13JAXsoiDc0ceKwkwN5WCtVy4dnyxp4kI95Rcc0/ZGf6	admin	f
2	Max	max@test.com	$2b$10$1bhYOWB9f13JAXsoiDc0ceKwkwN5WCtVy4dnyxp4kI95Rcc0/ZGf6	kunde	f
3	Mia	mia@test.com	$2b$10$1bhYOWB9f13JAXsoiDc0ceKwkwN5WCtVy4dnyxp4kI95Rcc0/ZGf6	kunde	f
5	Julian	julian@example.com	$2b$10$1bhYOWB9f13JAXsoiDc0ceKwkwN5WCtVy4dnyxp4kI95Rcc0/ZGf6	kunde	f
7	Claudia	claudia@test.com	$2b$10$5Da3gaTpCTuw1lI52p5iQuEkUeBasZza5d0N5.nUrasdCf3W4YpM6	kunde	f
9	Rahul	rahul@test.com	$2b$10$NEv62VMm/daR8uSuob0OW.3WjAEZL2EaysdHJDTJLsAwoc7aYsHGi	kunde	f
13	Eilish McColgan	eilish@test.com	$2b$10$6/EBe6iiZbedt94uu.G9UuFa3e8J.WxnPUZ1Y8y/N03oFGNsbo8HW	kunde	f
10	Pep Guardiola	claudia.niederhofer1804@gmail.com	$2b$10$1bhYOWB9f13JAXsoiDc0ceKwkwN5WCtVy4dnyxp4kI95Rcc0/ZGf6	trainer	f
11	Ottmar Hitzfeld	ottmar@trainer.com	$2b$10$ysBIazfoMg/ixv5gVoPIUu./1s709BoPDy4/6/LC1Ni0mk.nOjBJa	trainer	f
1	Vincent Kompany	vincent@test.de	$2b$10$3CDcSOmDnc0zoJhCrc6cpO8pTAbncEspmWlB7tnW8kD89SyyheuoO	trainer	f
\.


--
-- Name: bookings_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.bookings_id_seq', 24, true);


--
-- Name: courses_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.courses_id_seq', 21, true);


--
-- Name: ratings_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.ratings_id_seq', 19, true);


--
-- Name: reviews_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.reviews_id_seq', 6, true);


--
-- Name: users_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.users_id_seq', 14, true);


--
-- Name: bookings bookings_course_user_unique; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.bookings
    ADD CONSTRAINT bookings_course_user_unique UNIQUE (course_id, user_id);


--
-- Name: bookings bookings_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.bookings
    ADD CONSTRAINT bookings_pkey PRIMARY KEY (id);


--
-- Name: courses courses_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.courses
    ADD CONSTRAINT courses_pkey PRIMARY KEY (id);


--
-- Name: ratings ratings_course_id_user_id_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.ratings
    ADD CONSTRAINT ratings_course_id_user_id_key UNIQUE (course_id, user_id);


--
-- Name: ratings ratings_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.ratings
    ADD CONSTRAINT ratings_pkey PRIMARY KEY (id);


--
-- Name: reviews reviews_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.reviews
    ADD CONSTRAINT reviews_pkey PRIMARY KEY (id);


--
-- Name: sessions sessions_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.sessions
    ADD CONSTRAINT sessions_pkey PRIMARY KEY (id);


--
-- Name: reviews unique_review; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.reviews
    ADD CONSTRAINT unique_review UNIQUE (user_id, course_id);


--
-- Name: users users_email_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_email_key UNIQUE (email);


--
-- Name: users users_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_pkey PRIMARY KEY (id);


--
-- Name: bookings bookings_course_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.bookings
    ADD CONSTRAINT bookings_course_id_fkey FOREIGN KEY (course_id) REFERENCES public.courses(id);


--
-- Name: bookings bookings_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.bookings
    ADD CONSTRAINT bookings_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id);


--
-- Name: courses courses_trainer_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.courses
    ADD CONSTRAINT courses_trainer_id_fkey FOREIGN KEY (trainer_id) REFERENCES public.users(id);


--
-- Name: ratings ratings_course_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.ratings
    ADD CONSTRAINT ratings_course_id_fkey FOREIGN KEY (course_id) REFERENCES public.courses(id) ON DELETE CASCADE;


--
-- Name: ratings ratings_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.ratings
    ADD CONSTRAINT ratings_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: reviews reviews_course_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.reviews
    ADD CONSTRAINT reviews_course_id_fkey FOREIGN KEY (course_id) REFERENCES public.courses(id);


--
-- Name: reviews reviews_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.reviews
    ADD CONSTRAINT reviews_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id);


--
-- Name: sessions sessions_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.sessions
    ADD CONSTRAINT sessions_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id);


--
-- Name: TABLE bookings; Type: ACL; Schema: public; Owner: postgres
--

GRANT SELECT,INSERT,DELETE,UPDATE ON TABLE public.bookings TO fitness_admin;


--
-- Name: SEQUENCE bookings_id_seq; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON SEQUENCE public.bookings_id_seq TO fitness_admin;


--
-- Name: TABLE courses; Type: ACL; Schema: public; Owner: postgres
--

GRANT SELECT,INSERT,DELETE,UPDATE ON TABLE public.courses TO fitness_admin;


--
-- Name: SEQUENCE courses_id_seq; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON SEQUENCE public.courses_id_seq TO fitness_admin;


--
-- Name: TABLE ratings; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE public.ratings TO fitness_admin;


--
-- Name: SEQUENCE ratings_id_seq; Type: ACL; Schema: public; Owner: postgres
--

GRANT SELECT,USAGE ON SEQUENCE public.ratings_id_seq TO fitness_admin;


--
-- Name: TABLE reviews; Type: ACL; Schema: public; Owner: postgres
--

GRANT SELECT,INSERT,DELETE,UPDATE ON TABLE public.reviews TO fitness_admin;


--
-- Name: SEQUENCE reviews_id_seq; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON SEQUENCE public.reviews_id_seq TO fitness_admin;


--
-- Name: TABLE sessions; Type: ACL; Schema: public; Owner: postgres
--

GRANT SELECT,INSERT,DELETE,UPDATE ON TABLE public.sessions TO fitness_admin;


--
-- Name: TABLE users; Type: ACL; Schema: public; Owner: postgres
--

GRANT SELECT,INSERT,DELETE,UPDATE ON TABLE public.users TO fitness_admin;


--
-- Name: SEQUENCE users_id_seq; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON SEQUENCE public.users_id_seq TO fitness_admin;


--
-- PostgreSQL database dump complete
--

