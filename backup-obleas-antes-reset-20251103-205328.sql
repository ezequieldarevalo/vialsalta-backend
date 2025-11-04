--
-- PostgreSQL database dump
--

\restrict zLyUUESNZzkGWpWvC7k9MMhdJx9P4Lxtj5YbtJyOERew8u4hc185fyg0WgKrMQq

-- Dumped from database version 16.10 (Debian 16.10-1.pgdg13+1)
-- Dumped by pg_dump version 16.10 (Debian 16.10-1.pgdg13+1)

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

--
-- Name: bloques_obleas_estado_enum; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.bloques_obleas_estado_enum AS ENUM (
    'CREADO',
    'ASIGNADO',
    'EN_USO',
    'AGOTADO',
    'ANULADO'
);


ALTER TYPE public.bloques_obleas_estado_enum OWNER TO postgres;

--
-- Name: obleas_estado_enum; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.obleas_estado_enum AS ENUM (
    'DISPONIBLE',
    'ASIGNADA',
    'EMITIDA',
    'ANULADA'
);


ALTER TYPE public.obleas_estado_enum OWNER TO postgres;

--
-- Name: payments_status_enum; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.payments_status_enum AS ENUM (
    'PENDING',
    'APPROVED',
    'REJECTED',
    'REFUNDED'
);


ALTER TYPE public.payments_status_enum OWNER TO postgres;

--
-- Name: revisiones_resultado_enum; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.revisiones_resultado_enum AS ENUM (
    'APROBADO',
    'RECHAZADO',
    'CONDICIONAL'
);


ALTER TYPE public.revisiones_resultado_enum OWNER TO postgres;

--
-- Name: subscriptions_billingperiod_enum; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.subscriptions_billingperiod_enum AS ENUM (
    'MONTHLY',
    'ANNUAL'
);


ALTER TYPE public.subscriptions_billingperiod_enum OWNER TO postgres;

--
-- Name: subscriptions_status_enum; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.subscriptions_status_enum AS ENUM (
    'ACTIVE',
    'PENDING',
    'SUSPENDED',
    'CANCELLED'
);


ALTER TYPE public.subscriptions_status_enum OWNER TO postgres;

--
-- Name: users_role_enum; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.users_role_enum AS ENUM (
    'CAMARA',
    'PLANTA_ADMIN',
    'PLANTA_OPERADOR',
    'MUNICIPIO'
);


ALTER TYPE public.users_role_enum OWNER TO postgres;

--
-- Name: vehiculos_combustible_enum; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.vehiculos_combustible_enum AS ENUM (
    'NAFTA',
    'DIESEL',
    'GNC',
    'ELECTRICO',
    'HIBRIDO'
);


ALTER TYPE public.vehiculos_combustible_enum OWNER TO postgres;

--
-- Name: vehiculos_tipo_enum; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.vehiculos_tipo_enum AS ENUM (
    'AUTOMOVIL',
    'CAMIONETA',
    'CAMION',
    'MOTO',
    'COLECTIVO',
    'OTRO'
);


ALTER TYPE public.vehiculos_tipo_enum OWNER TO postgres;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: bloques_obleas; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.bloques_obleas (
    id integer NOT NULL,
    codigo character varying(50) NOT NULL,
    "camaraId" integer,
    "plantaId" integer,
    "numeroInicio" integer NOT NULL,
    "numeroFin" integer NOT NULL,
    "cantidadTotal" integer NOT NULL,
    estado public.bloques_obleas_estado_enum DEFAULT 'CREADO'::public.bloques_obleas_estado_enum NOT NULL,
    "createdAt" timestamp without time zone DEFAULT now() NOT NULL,
    "fechaAsignacion" timestamp without time zone,
    "updatedAt" timestamp without time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.bloques_obleas OWNER TO postgres;

--
-- Name: bloques_obleas_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.bloques_obleas_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.bloques_obleas_id_seq OWNER TO postgres;

--
-- Name: bloques_obleas_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.bloques_obleas_id_seq OWNED BY public.bloques_obleas.id;


--
-- Name: camaras; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.camaras (
    id integer NOT NULL,
    nombre character varying(200) NOT NULL,
    provincia character varying(100) NOT NULL,
    codigo character varying(10) NOT NULL,
    "rangoInicio" integer NOT NULL,
    "rangoFin" integer NOT NULL,
    cuit character varying(20) NOT NULL,
    direccion text,
    telefono character varying(100),
    email character varying(200),
    activa boolean DEFAULT true NOT NULL,
    "createdAt" timestamp without time zone DEFAULT now() NOT NULL,
    "updatedAt" timestamp without time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.camaras OWNER TO postgres;

--
-- Name: camaras_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.camaras_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.camaras_id_seq OWNER TO postgres;

--
-- Name: camaras_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.camaras_id_seq OWNED BY public.camaras.id;


--
-- Name: certificados; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.certificados (
    id integer NOT NULL,
    "revisionId" integer,
    "oleaId" integer,
    "numeroCertificado" character varying(50) NOT NULL,
    "codigoQr" text NOT NULL,
    "urlPdf" text,
    "urlVerificacion" text,
    "fechaEmision" timestamp without time zone NOT NULL,
    "fechaVencimiento" timestamp without time zone NOT NULL,
    "createdAt" timestamp without time zone DEFAULT now() NOT NULL,
    "updatedAt" timestamp without time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.certificados OWNER TO postgres;

--
-- Name: certificados_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.certificados_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.certificados_id_seq OWNER TO postgres;

--
-- Name: certificados_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.certificados_id_seq OWNED BY public.certificados.id;


--
-- Name: municipios; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.municipios (
    id integer NOT NULL,
    "camaraId" integer NOT NULL,
    nombre character varying(200) NOT NULL,
    codigo character varying(50) NOT NULL,
    "porcentajeReparto" numeric(5,2) DEFAULT '0'::numeric NOT NULL,
    activo boolean DEFAULT true NOT NULL,
    "createdAt" timestamp without time zone DEFAULT now() NOT NULL,
    "updatedAt" timestamp without time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.municipios OWNER TO postgres;

--
-- Name: municipios_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.municipios_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.municipios_id_seq OWNER TO postgres;

--
-- Name: municipios_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.municipios_id_seq OWNED BY public.municipios.id;


--
-- Name: obleas; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.obleas (
    id integer NOT NULL,
    "bloqueId" integer NOT NULL,
    "camaraId" integer NOT NULL,
    "plantaId" integer,
    "revisionId" integer,
    numero integer NOT NULL,
    "codigoQr" text,
    estado public.obleas_estado_enum DEFAULT 'DISPONIBLE'::public.obleas_estado_enum NOT NULL,
    "createdAt" timestamp without time zone DEFAULT now() NOT NULL,
    "fechaAsignacion" timestamp without time zone,
    "fechaEmision" timestamp without time zone,
    "updatedAt" timestamp without time zone DEFAULT now() NOT NULL,
    "qrActivo" boolean DEFAULT false NOT NULL
);


ALTER TABLE public.obleas OWNER TO postgres;

--
-- Name: obleas_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.obleas_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.obleas_id_seq OWNER TO postgres;

--
-- Name: obleas_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.obleas_id_seq OWNED BY public.obleas.id;


--
-- Name: payments; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.payments (
    id integer NOT NULL,
    "subscriptionId" integer NOT NULL,
    "mercadopagoPaymentId" character varying NOT NULL,
    status public.payments_status_enum DEFAULT 'PENDING'::public.payments_status_enum NOT NULL,
    amount numeric(10,2) NOT NULL,
    currency character varying DEFAULT 'ARS'::character varying NOT NULL,
    "paymentMethod" character varying,
    "paidAt" timestamp without time zone,
    metadata json,
    "createdAt" timestamp without time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.payments OWNER TO postgres;

--
-- Name: payments_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.payments_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.payments_id_seq OWNER TO postgres;

--
-- Name: payments_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.payments_id_seq OWNED BY public.payments.id;


--
-- Name: plantas; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.plantas (
    id integer NOT NULL,
    "camaraId" integer NOT NULL,
    "municipioId" integer NOT NULL,
    nombre character varying(200) NOT NULL,
    cuit character varying(15),
    direccion text,
    "codigoHabilitacion" character varying(100) NOT NULL,
    telefono character varying(100),
    email character varying(200),
    activa boolean DEFAULT true NOT NULL,
    "createdAt" timestamp without time zone DEFAULT now() NOT NULL,
    "updatedAt" timestamp without time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.plantas OWNER TO postgres;

--
-- Name: plantas_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.plantas_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.plantas_id_seq OWNER TO postgres;

--
-- Name: plantas_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.plantas_id_seq OWNED BY public.plantas.id;


--
-- Name: revisiones; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.revisiones (
    id integer NOT NULL,
    "plantaId" integer NOT NULL,
    "vehiculoId" integer NOT NULL,
    "oleaId" integer,
    "usuarioId" integer NOT NULL,
    resultado public.revisiones_resultado_enum NOT NULL,
    "fechaRevision" timestamp without time zone NOT NULL,
    "fechaVencimiento" timestamp without time zone,
    observaciones text,
    "urlFoto" text,
    kilometraje numeric(10,2),
    "createdAt" timestamp without time zone DEFAULT now() NOT NULL,
    "updatedAt" timestamp without time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.revisiones OWNER TO postgres;

--
-- Name: revisiones_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.revisiones_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.revisiones_id_seq OWNER TO postgres;

--
-- Name: revisiones_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.revisiones_id_seq OWNED BY public.revisiones.id;


--
-- Name: subscriptions; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.subscriptions (
    id integer NOT NULL,
    "plantaId" integer NOT NULL,
    status public.subscriptions_status_enum DEFAULT 'PENDING'::public.subscriptions_status_enum NOT NULL,
    "billingPeriod" public.subscriptions_billingperiod_enum DEFAULT 'MONTHLY'::public.subscriptions_billingperiod_enum NOT NULL,
    amount numeric(10,2) NOT NULL,
    "mercadopagoSubscriptionId" character varying,
    "mercadopagoCustomerId" character varying,
    "currentPeriodStart" timestamp without time zone,
    "currentPeriodEnd" timestamp without time zone,
    "trialEnd" timestamp without time zone,
    "cancelledAt" timestamp without time zone,
    "autoRenew" boolean DEFAULT true NOT NULL,
    "createdAt" timestamp without time zone DEFAULT now() NOT NULL,
    "updatedAt" timestamp without time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.subscriptions OWNER TO postgres;

--
-- Name: subscriptions_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.subscriptions_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.subscriptions_id_seq OWNER TO postgres;

--
-- Name: subscriptions_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.subscriptions_id_seq OWNED BY public.subscriptions.id;


--
-- Name: tipos_vehiculo; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.tipos_vehiculo (
    id integer NOT NULL,
    nombre character varying NOT NULL,
    descripcion text,
    activo boolean DEFAULT true NOT NULL,
    "createdAt" timestamp without time zone DEFAULT now() NOT NULL,
    "updatedAt" timestamp without time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.tipos_vehiculo OWNER TO postgres;

--
-- Name: tipos_vehiculo_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.tipos_vehiculo_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.tipos_vehiculo_id_seq OWNER TO postgres;

--
-- Name: tipos_vehiculo_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.tipos_vehiculo_id_seq OWNED BY public.tipos_vehiculo.id;


--
-- Name: users; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.users (
    id integer NOT NULL,
    "camaraId" integer,
    "plantaId" integer,
    "municipioId" integer,
    username character varying(100) NOT NULL,
    email character varying(200) NOT NULL,
    nombre character varying(200),
    password text NOT NULL,
    role public.users_role_enum NOT NULL,
    activo boolean DEFAULT true NOT NULL,
    "createdAt" timestamp without time zone DEFAULT now() NOT NULL,
    "updatedAt" timestamp without time zone DEFAULT now() NOT NULL
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


ALTER SEQUENCE public.users_id_seq OWNER TO postgres;

--
-- Name: users_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.users_id_seq OWNED BY public.users.id;


--
-- Name: vehiculos; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.vehiculos (
    id integer NOT NULL,
    dominio character varying(10) NOT NULL,
    marca character varying(100) NOT NULL,
    modelo character varying(100) NOT NULL,
    anio integer NOT NULL,
    tipo public.vehiculos_tipo_enum,
    combustible public.vehiculos_combustible_enum NOT NULL,
    "numeroMotor" character varying(100),
    "numeroChasis" character varying(100),
    "createdAt" timestamp without time zone DEFAULT now() NOT NULL,
    "updatedAt" timestamp without time zone DEFAULT now() NOT NULL,
    "tipoVehiculoId" integer,
    "fechaPrimeraMatriculacion" date
);


ALTER TABLE public.vehiculos OWNER TO postgres;

--
-- Name: vehiculos_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.vehiculos_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.vehiculos_id_seq OWNER TO postgres;

--
-- Name: vehiculos_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.vehiculos_id_seq OWNED BY public.vehiculos.id;


--
-- Name: bloques_obleas id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.bloques_obleas ALTER COLUMN id SET DEFAULT nextval('public.bloques_obleas_id_seq'::regclass);


--
-- Name: camaras id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.camaras ALTER COLUMN id SET DEFAULT nextval('public.camaras_id_seq'::regclass);


--
-- Name: certificados id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.certificados ALTER COLUMN id SET DEFAULT nextval('public.certificados_id_seq'::regclass);


--
-- Name: municipios id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.municipios ALTER COLUMN id SET DEFAULT nextval('public.municipios_id_seq'::regclass);


--
-- Name: obleas id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.obleas ALTER COLUMN id SET DEFAULT nextval('public.obleas_id_seq'::regclass);


--
-- Name: payments id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.payments ALTER COLUMN id SET DEFAULT nextval('public.payments_id_seq'::regclass);


--
-- Name: plantas id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.plantas ALTER COLUMN id SET DEFAULT nextval('public.plantas_id_seq'::regclass);


--
-- Name: revisiones id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.revisiones ALTER COLUMN id SET DEFAULT nextval('public.revisiones_id_seq'::regclass);


--
-- Name: subscriptions id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.subscriptions ALTER COLUMN id SET DEFAULT nextval('public.subscriptions_id_seq'::regclass);


--
-- Name: tipos_vehiculo id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.tipos_vehiculo ALTER COLUMN id SET DEFAULT nextval('public.tipos_vehiculo_id_seq'::regclass);


--
-- Name: users id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users ALTER COLUMN id SET DEFAULT nextval('public.users_id_seq'::regclass);


--
-- Name: vehiculos id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.vehiculos ALTER COLUMN id SET DEFAULT nextval('public.vehiculos_id_seq'::regclass);


--
-- Data for Name: bloques_obleas; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.bloques_obleas (id, codigo, "camaraId", "plantaId", "numeroInicio", "numeroFin", "cantidadTotal", estado, "createdAt", "fechaAsignacion", "updatedAt") FROM stdin;
1	BLQ-SAL-2025-001	1	1	1000000	1000099	100	ASIGNADO	2025-11-02 22:22:23.635156	2025-01-14 21:00:00	2025-11-02 22:22:23.635156
2	BLQ-SAL-2025-002	1	2	1000100	1000199	100	ASIGNADO	2025-11-02 22:22:23.639455	2025-01-14 21:00:00	2025-11-02 22:22:23.639455
3	BLQ-SAL-2025-003	1	\N	1000200	1000299	100	CREADO	2025-11-02 22:22:23.642399	\N	2025-11-02 22:22:23.642399
4	BLQ-CBA-2025-001	2	4	2000000	2000099	100	ASIGNADO	2025-11-02 22:22:23.64495	2025-01-09 21:00:00	2025-11-02 22:22:23.64495
5	BLQ-CBA-2025-002	2	\N	2000100	2000199	100	CREADO	2025-11-02 22:22:23.64722	\N	2025-11-02 22:22:23.64722
6	BLQ-TUC-2025-001	3	6	3000000	3000099	100	ASIGNADO	2025-11-02 22:22:23.650086	2025-01-11 21:00:00	2025-11-02 22:22:23.650086
7	BLQ-SAL-2025-004	1	1	1000300	1000349	50	ASIGNADO	2025-11-03 19:21:01.625914	\N	2025-11-03 19:21:01.625914
\.


--
-- Data for Name: camaras; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.camaras (id, nombre, provincia, codigo, "rangoInicio", "rangoFin", cuit, direccion, telefono, email, activa, "createdAt", "updatedAt") FROM stdin;
1	Cámara de Talleres de Revisión Técnica Vehicular de Salta	Salta	SAL	1000000	1999999	30-12345678-9	Av. Belgrano 123, Salta Capital	+54 387 4321000	contacto@camarasalta.gob.ar	t	2025-11-02 22:22:23.420877	2025-11-02 22:22:23.420877
2	Cámara de Talleres de Revisión Técnica de Córdoba	Córdoba	CBA	2000000	2999999	30-98765432-1	Av. Colón 456, Córdoba Capital	+54 351 4567890	info@camaracordoba.org.ar	t	2025-11-02 22:22:23.433056	2025-11-02 22:22:23.433056
3	Cámara de Plantas de VTV de Tucumán	Tucumán	TUC	3000000	3999999	30-11223344-5	Av. Mate de Luna 789, San Miguel de Tucumán	+54 381 4123456	contacto@camaratucuman.gob.ar	t	2025-11-02 22:22:23.43745	2025-11-02 22:22:23.43745
\.


--
-- Data for Name: certificados; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.certificados (id, "revisionId", "oleaId", "numeroCertificado", "codigoQr", "urlPdf", "urlVerificacion", "fechaEmision", "fechaVencimiento", "createdAt", "updatedAt") FROM stdin;
1	1	11	CERT-1-1762122668795	data:image/png;base64,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	\N	http://localhost:5173/verificar/QR-1000000-1762122668753-1-2ded67aa08ea98be	2025-11-02 19:31:08.795	2026-11-02 19:31:08.795	2025-11-02 22:31:08.79634	2025-11-02 22:31:08.79634
2	2	12	CERT-2-1762196447920	data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAALQAAAC0CAYAAAA9zQYyAAAAAklEQVR4AewaftIAAAeCSURBVO3BQW4ERrIoSfcE739lHy1jNgkUitRT5w8z+wdrPeKw1kMOaz3ksNZDDms95LDWQw5rPeSw1kMOaz3ksNZDDms95LDWQw5rPeSw1kMOaz3ksNZDfviSyr+p4hsqU8WNylRxo3JTMal8omJSmSpuVG4qJpV/U8U3Dms95LDWQw5rPeSHX1bxm1S+oXKjMlVMFZPKTcWkMqlMFd+ouFGZKiaVT1T8JpXfdFjrIYe1HnJY6yE//DGVT1R8QuWm4kblRmWquFGZKiaVSeWmYlK5qZgqJpWp4hsqn6j4S4e1HnJY6yGHtR7yw/r/UZkqblSmiknlpuJG5aZiUpkqblSmiv9lh7UecljrIYe1HvLD/2NUpopvVNxUTCo3KlPFpHJTMalMFZPKSw5rPeSw1kMOaz3khz9W8W+qmFSmit+kMlVMKjcqn6j4RMWk8psq/ksOaz3ksNZDDms95IdfpvK/RGWqmFSmim9UTCpTxaQyVUwqU8WkMlVMKp9Q+S87rPWQw1oPOaz1kB++VPFfVvGNim9UTCq/qWJS+UTFTcX/ksNaDzms9ZDDWg+xf/AFlaliUvlNFTcqU8VvUpkqblSmikllqvhNKjcVNyq/qeIvHdZ6yGGthxzWesgPf6ziRmWquFG5qZhUbiomlaniRuWm4qbiRmWqmFRuKj6hclMxqUwVk8qkMlX8psNaDzms9ZDDWg/54Y+pfEPlpmJSuam4qbip+E0qNxU3FZPKJ1RuKiaVqeKmYlKZVKaKbxzWeshhrYcc1nqI/YN/kcpNxV9SmSpuVKaKSWWq+IbKNypuVKaKSWWquFGZKiaVqWJSmSq+cVjrIYe1HnJY6yH2D/7DVD5RMalMFZPKTcU3VKaKT6h8o2JS+UbFpDJV3KjcVHzjsNZDDms95LDWQ+wffEHlL1VMKlPFpDJV3Kh8ouJG5TdVTCpTxaRyUzGpTBU3KlPFf8lhrYcc1nrIYa2H/PDLKm5UpopJZVK5UZkqPlExqUwVk8pUcVPxCZWbiknlpmJS+YTKVHGjMlVMKjcV3zis9ZDDWg85rPUQ+wf/h1RuKiaVqeIbKlPFjco3Km5UpopJZaq4UZkqJpXfVPEJlaniG4e1HnJY6yGHtR7yw5dUpooblaniRuVGZaq4UflGxaQyVfylikllqpgqbiomlZuKSeVGZar4S4e1HnJY6yGHtR7ywx9TmSo+UXGj8o2KSeUTFTcqU8Wk8pdUbiqmihuVqWJSmSomlaniNx3WeshhrYcc1nrID1+q+IbKVDGpfEJlqpgqfpPKVHGjMlXcqEwVU8UnKiaVqWJS+UsqU8U3Dms95LDWQw5rPcT+wS9SmSomlaliUpkqJpWpYlK5qZhUbiomlaliUvlNFZPKTcWkclMxqUwVNyqfqJhUpopvHNZ6yGGthxzWesgPv6ziN6lMFZPKTcWkMlVMKpPKX6q4UZkqblSmim+oTBU3FZ+o+E2HtR5yWOshh7Ue8sN/XMWkMlVMKr+p4hMVNyqfqJhUpoqpYlKZKiaVqeJGZaqYVKaKf9NhrYcc1nrIYa2H2D/4P6Tymyr+S1Smik+oTBU3KlPFpDJVfELlExWTyk3FNw5rPeSw1kMOaz3kh/+4iknlRmWqmFRuKm5UpoqbikllqripmFSmiqliUvmEyv+yw1oPOaz1kMNaD/nhSyo3FZPKTcWkMlXcqHxDZar4hspUMal8Q+Wm4hMVNypTxY3KVPGXDms95LDWQw5rPeSHX1YxqdxU3FRMKr+pYlL5hMpUMVXcVHxC5aZiUrmpmFSmiqliUvkvOaz1kMNaDzms9ZAf/mNU/ktUporfpHJTcVNxUzGpTCpTxaQyVUwVk8pUMancVHzjsNZDDms95LDWQ374YxXfqPiEyidUvqEyVUwqU8VUMalMKlPFpDJVTCpTxY3Kb1K5qfhNh7UecljrIYe1HvLD/zGVG5Wbik9U3Kh8ouIbKlPFpPIJlaliUvmGyk3FpPJvOqz1kMNaDzms9RD7B//DVL5RMal8omJS+U0Vk8pNxaTyiYpPqHyi4i8d1nrIYa2HHNZ6yA9fUvk3VUwVk8pUcaPylypuVD5R8YmKG5UblaniGyo3Fd84rPWQw1oPOaz1kB9+WcVvUrlRmSpuVKaKSeU3qUwVU8WkMqn8popPVHyj4kblNx3WeshhrYcc1nrID39M5RMVf6nipuJGZVKZKn5TxSdUpopJ5UblN6lMFX/psNZDDms95LDWQ374f4zKTcUnKm5UpopJ5UZlqphUpopJ5aZiUrmpmFRuKiaVv3RY6yGHtR5yWOshPzxG5aZiUplUpooblaniRmWq+EbFpHJTMalMFZ+omFQmlaliUvlNh7UecljrIYe1HvLDH6v4SxWfUJkqblRuKr6h8psqJpVJ5RMq36j4Nx3WeshhrYcc1nrID79M5d+kMlVMKjcqNxWTym+quFGZKm5UpopJ5UblN6n8mw5rPeSw1kMOaz3E/sFajzis9ZDDWg85rPWQw1oPOaz1kMNaDzms9ZDDWg85rPWQw1oPOaz1kMNaDzms9ZDDWg85rPWQ/w8Va+aG3bYtewAAAABJRU5ErkJggg==	\N	http://localhost:5173/verificar/QR-1000001-1762196447904-2-64a0489bf6b4acb6	2025-11-03 16:00:47.92	2026-11-03 16:00:47.92	2025-11-03 19:00:47.921396	2025-11-03 19:00:47.921396
3	4	13	CERT-4-1762199885608	data:image/png;base64,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	\N	http://localhost:5173/verificar/OBL-1000002-1166cab25b581ca0	2025-11-03 16:58:05.608	2026-11-03 16:58:05.608	2025-11-03 19:58:05.60954	2025-11-03 19:58:05.60954
4	6	\N	CERT-6-1762202372029	data:image/png;base64,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	\N	http://localhost:5173/verificar/COND-6-1762202372002	2025-11-03 17:39:32.029	2026-01-02 17:37:55.368	2025-11-03 20:39:32.030722	2025-11-03 20:39:32.030722
5	5	\N	CERT-5-1762202375107	data:image/png;base64,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	\N	http://localhost:5173/verificar/COND-5-1762202375093	2025-11-03 17:39:35.107	2026-01-02 17:22:02.791	2025-11-03 20:39:35.108433	2025-11-03 20:39:35.108433
6	7	\N	CERT-7-1762202616996	data:image/png;base64,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	\N	http://localhost:5173/verificar/COND-7-1762202616991	2025-11-03 17:43:36.996	2026-01-02 17:43:24.476	2025-11-03 20:43:36.996887	2025-11-03 20:43:36.996887
7	8	\N	CERT-8-1762203802426	data:image/png;base64,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	\N	http://localhost:5173/verificar/COND-8-1762203802410	2025-11-03 18:03:22.426	2026-01-02 18:03:09.361	2025-11-03 21:03:22.426854	2025-11-03 21:03:22.426854
8	9	14	CERT-9-1762213438313	data:image/png;base64,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	\N	http://localhost:5173/verificar/OBL-1000003-b4dfd068b1d1da5f	2025-11-03 20:43:58.313	2027-11-03 20:35:45.422	2025-11-03 23:43:58.314141	2025-11-03 23:43:58.314141
\.


--
-- Data for Name: municipios; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.municipios (id, "camaraId", nombre, codigo, "porcentajeReparto", activo, "createdAt", "updatedAt") FROM stdin;
1	1	Salta Capital	SAL-001	35.00	t	2025-11-02 22:22:23.442975	2025-11-02 22:22:23.442975
2	1	Orán	SAL-002	15.00	t	2025-11-02 22:22:23.447236	2025-11-02 22:22:23.447236
3	1	Tartagal	SAL-003	12.00	t	2025-11-02 22:22:23.450537	2025-11-02 22:22:23.450537
4	1	Metán	SAL-004	10.00	t	2025-11-02 22:22:23.453338	2025-11-02 22:22:23.453338
5	1	Cafayate	SAL-005	8.00	t	2025-11-02 22:22:23.457155	2025-11-02 22:22:23.457155
6	2	Córdoba Capital	CBA-001	40.00	t	2025-11-02 22:22:23.472012	2025-11-02 22:22:23.472012
7	2	Villa María	CBA-002	15.00	t	2025-11-02 22:22:23.476489	2025-11-02 22:22:23.476489
8	2	Río Cuarto	CBA-003	15.00	t	2025-11-02 22:22:23.47916	2025-11-02 22:22:23.47916
9	3	San Miguel de Tucumán	TUC-001	50.00	t	2025-11-02 22:22:23.482231	2025-11-02 22:22:23.482231
10	3	Yerba Buena	TUC-002	20.00	t	2025-11-02 22:22:23.484944	2025-11-02 22:22:23.484944
\.


--
-- Data for Name: obleas; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.obleas (id, "bloqueId", "camaraId", "plantaId", "revisionId", numero, "codigoQr", estado, "createdAt", "fechaAsignacion", "fechaEmision", "updatedAt", "qrActivo") FROM stdin;
13	1	1	1	4	1000002	http://localhost:5173/verificar/OBL-1000002-1166cab25b581ca0	ASIGNADA	2025-11-02 22:22:23.693492	2025-11-03 16:58:05.558	\N	2025-11-03 19:58:05.56205	t
12	1	1	1	\N	1000001	http://localhost:5173/verificar/OBL-1000001-166fe6b7446ad6e5	ASIGNADA	2025-11-02 22:22:23.690562	2025-11-03 16:00:47.883	\N	2025-11-03 19:00:47.887302	f
1	2	1	2	\N	1000100	http://localhost:5173/verificar/OBL-1000100-356c3bf4e09efbb1	DISPONIBLE	2025-11-02 22:22:23.661842	\N	\N	2025-11-02 22:22:23.661842	f
2	2	1	2	\N	1000101	http://localhost:5173/verificar/OBL-1000101-753cd100dc3de38c	DISPONIBLE	2025-11-02 22:22:23.664769	\N	\N	2025-11-02 22:22:23.664769	f
4	2	1	2	\N	1000103	http://localhost:5173/verificar/OBL-1000103-7c72d79f50079124	DISPONIBLE	2025-11-02 22:22:23.669935	\N	\N	2025-11-02 22:22:23.669935	f
5	2	1	2	\N	1000104	http://localhost:5173/verificar/OBL-1000104-df77eebcc362b951	DISPONIBLE	2025-11-02 22:22:23.673035	\N	\N	2025-11-02 22:22:23.673035	f
6	2	1	2	\N	1000105	http://localhost:5173/verificar/OBL-1000105-7eefc01d37c85ac4	DISPONIBLE	2025-11-02 22:22:23.67653	\N	\N	2025-11-02 22:22:23.67653	f
8	2	1	2	\N	1000107	http://localhost:5173/verificar/OBL-1000107-863ad0181e5ec829	DISPONIBLE	2025-11-02 22:22:23.682104	\N	\N	2025-11-02 22:22:23.682104	f
9	2	1	2	\N	1000108	http://localhost:5173/verificar/OBL-1000108-bcca7a44430633e2	DISPONIBLE	2025-11-02 22:22:23.683858	\N	\N	2025-11-02 22:22:23.683858	f
11	1	1	1	\N	1000000	http://localhost:5173/verificar/OBL-1000000-4f85d82cd2944569	ASIGNADA	2025-11-02 22:22:23.687551	2025-11-02 19:31:08.702	\N	2025-11-02 22:31:08.710213	f
15	1	1	1	\N	1000004	http://localhost:5173/verificar/OBL-1000004-9658740befb0df27	DISPONIBLE	2025-11-02 22:22:23.697948	\N	\N	2025-11-02 22:22:23.697948	f
16	1	1	1	\N	1000005	http://localhost:5173/verificar/OBL-1000005-2298bc2de0f187ef	DISPONIBLE	2025-11-02 22:22:23.699827	\N	\N	2025-11-02 22:22:23.699827	f
18	1	1	1	\N	1000007	http://localhost:5173/verificar/OBL-1000007-75ae5f43dca3884d	DISPONIBLE	2025-11-02 22:22:23.703526	\N	\N	2025-11-02 22:22:23.703526	f
19	1	1	1	\N	1000008	http://localhost:5173/verificar/OBL-1000008-c7c336294e8919f7	DISPONIBLE	2025-11-02 22:22:23.706477	\N	\N	2025-11-02 22:22:23.706477	f
21	4	2	4	\N	2000000	http://localhost:5173/verificar/OBL-2000000-54be521fa381830a	DISPONIBLE	2025-11-02 22:22:23.712002	\N	\N	2025-11-02 22:22:23.712002	f
22	4	2	4	\N	2000001	http://localhost:5173/verificar/OBL-2000001-0afe8d0c0607e610	DISPONIBLE	2025-11-02 22:22:23.713881	\N	\N	2025-11-02 22:22:23.713881	f
23	4	2	4	\N	2000002	http://localhost:5173/verificar/OBL-2000002-c06fa52ca3bda011	DISPONIBLE	2025-11-02 22:22:23.715726	\N	\N	2025-11-02 22:22:23.715726	f
25	4	2	4	\N	2000004	http://localhost:5173/verificar/OBL-2000004-4ea0e9de5aacff9f	DISPONIBLE	2025-11-02 22:22:23.719958	\N	\N	2025-11-02 22:22:23.719958	f
26	4	2	4	\N	2000005	http://localhost:5173/verificar/OBL-2000005-d1bdd8eb5c600da9	DISPONIBLE	2025-11-02 22:22:23.72239	\N	\N	2025-11-02 22:22:23.72239	f
28	4	2	4	\N	2000007	http://localhost:5173/verificar/OBL-2000007-ae3326ecf0a962fc	DISPONIBLE	2025-11-02 22:22:23.728676	\N	\N	2025-11-02 22:22:23.728676	f
29	4	2	4	\N	2000008	http://localhost:5173/verificar/OBL-2000008-d01ff7b2adf4347b	DISPONIBLE	2025-11-02 22:22:23.731001	\N	\N	2025-11-02 22:22:23.731001	f
31	6	3	6	\N	3000000	http://localhost:5173/verificar/OBL-3000000-6155ecaf117189ae	DISPONIBLE	2025-11-02 22:22:23.734957	\N	\N	2025-11-02 22:22:23.734957	f
32	6	3	6	\N	3000001	http://localhost:5173/verificar/OBL-3000001-3aafc1ea34b897b0	DISPONIBLE	2025-11-02 22:22:23.737216	\N	\N	2025-11-02 22:22:23.737216	f
33	6	3	6	\N	3000002	http://localhost:5173/verificar/OBL-3000002-ab5f14d6440930a9	DISPONIBLE	2025-11-02 22:22:23.741036	\N	\N	2025-11-02 22:22:23.741036	f
35	6	3	6	\N	3000004	http://localhost:5173/verificar/OBL-3000004-6bae381cf6c5b846	DISPONIBLE	2025-11-02 22:22:23.745768	\N	\N	2025-11-02 22:22:23.745768	f
36	6	3	6	\N	3000005	http://localhost:5173/verificar/OBL-3000005-2dde1f0e1055a642	DISPONIBLE	2025-11-02 22:22:23.747831	\N	\N	2025-11-02 22:22:23.747831	f
38	6	3	6	\N	3000007	http://localhost:5173/verificar/OBL-3000007-e584426ee5ee3f14	DISPONIBLE	2025-11-02 22:22:23.753072	\N	\N	2025-11-02 22:22:23.753072	f
39	6	3	6	\N	3000008	http://localhost:5173/verificar/OBL-3000008-f3be6affe01fd7f8	DISPONIBLE	2025-11-02 22:22:23.756122	\N	\N	2025-11-02 22:22:23.756122	f
40	6	3	6	\N	3000009	http://localhost:5173/verificar/OBL-3000009-53c6593ed7247962	DISPONIBLE	2025-11-02 22:22:23.758461	\N	\N	2025-11-02 22:22:23.758461	f
42	7	1	\N	\N	1000301	http://localhost:5173/verificar/OBL-1000301-6bebaa05b56aa018	DISPONIBLE	2025-11-03 19:21:01.633919	\N	\N	2025-11-03 19:21:01.633919	f
43	7	1	\N	\N	1000302	http://localhost:5173/verificar/OBL-1000302-df98b501d28113e5	DISPONIBLE	2025-11-03 19:21:01.633919	\N	\N	2025-11-03 19:21:01.633919	f
45	7	1	\N	\N	1000304	http://localhost:5173/verificar/OBL-1000304-4542976221edf924	DISPONIBLE	2025-11-03 19:21:01.633919	\N	\N	2025-11-03 19:21:01.633919	f
46	7	1	\N	\N	1000305	http://localhost:5173/verificar/OBL-1000305-9066117728fc443a	DISPONIBLE	2025-11-03 19:21:01.633919	\N	\N	2025-11-03 19:21:01.633919	f
47	7	1	\N	\N	1000306	http://localhost:5173/verificar/OBL-1000306-cdf9a9badb0eb64a	DISPONIBLE	2025-11-03 19:21:01.633919	\N	\N	2025-11-03 19:21:01.633919	f
48	7	1	\N	\N	1000307	http://localhost:5173/verificar/OBL-1000307-dd1939849e95ef39	DISPONIBLE	2025-11-03 19:21:01.633919	\N	\N	2025-11-03 19:21:01.633919	f
50	7	1	\N	\N	1000309	http://localhost:5173/verificar/OBL-1000309-8413df0ff34e4d88	DISPONIBLE	2025-11-03 19:21:01.633919	\N	\N	2025-11-03 19:21:01.633919	f
51	7	1	\N	\N	1000310	http://localhost:5173/verificar/OBL-1000310-dac23398e1b74c5e	DISPONIBLE	2025-11-03 19:21:01.633919	\N	\N	2025-11-03 19:21:01.633919	f
52	7	1	\N	\N	1000311	http://localhost:5173/verificar/OBL-1000311-39e48a2b8b16ce02	DISPONIBLE	2025-11-03 19:21:01.633919	\N	\N	2025-11-03 19:21:01.633919	f
54	7	1	\N	\N	1000313	http://localhost:5173/verificar/OBL-1000313-bdb3a6aa3ca1a4e1	DISPONIBLE	2025-11-03 19:21:01.633919	\N	\N	2025-11-03 19:21:01.633919	f
55	7	1	\N	\N	1000314	http://localhost:5173/verificar/OBL-1000314-17bd0135a6c7ca48	DISPONIBLE	2025-11-03 19:21:01.633919	\N	\N	2025-11-03 19:21:01.633919	f
56	7	1	\N	\N	1000315	http://localhost:5173/verificar/OBL-1000315-87aca7561375ae11	DISPONIBLE	2025-11-03 19:21:01.633919	\N	\N	2025-11-03 19:21:01.633919	f
58	7	1	\N	\N	1000317	http://localhost:5173/verificar/OBL-1000317-54c3730f861ec65e	DISPONIBLE	2025-11-03 19:21:01.633919	\N	\N	2025-11-03 19:21:01.633919	f
59	7	1	\N	\N	1000318	http://localhost:5173/verificar/OBL-1000318-c810cfb1770373cf	DISPONIBLE	2025-11-03 19:21:01.633919	\N	\N	2025-11-03 19:21:01.633919	f
60	7	1	\N	\N	1000319	http://localhost:5173/verificar/OBL-1000319-aa4f88e6a02c9a60	DISPONIBLE	2025-11-03 19:21:01.633919	\N	\N	2025-11-03 19:21:01.633919	f
62	7	1	\N	\N	1000321	http://localhost:5173/verificar/OBL-1000321-d20fec81060323dd	DISPONIBLE	2025-11-03 19:21:01.633919	\N	\N	2025-11-03 19:21:01.633919	f
63	7	1	\N	\N	1000322	http://localhost:5173/verificar/OBL-1000322-5debf633d1c37cf6	DISPONIBLE	2025-11-03 19:21:01.633919	\N	\N	2025-11-03 19:21:01.633919	f
64	7	1	\N	\N	1000323	http://localhost:5173/verificar/OBL-1000323-ad5babe68d390686	DISPONIBLE	2025-11-03 19:21:01.633919	\N	\N	2025-11-03 19:21:01.633919	f
66	7	1	\N	\N	1000325	http://localhost:5173/verificar/OBL-1000325-6e0d23352bb6b3f6	DISPONIBLE	2025-11-03 19:21:01.633919	\N	\N	2025-11-03 19:21:01.633919	f
67	7	1	\N	\N	1000326	http://localhost:5173/verificar/OBL-1000326-ef6d66e99dfa4c39	DISPONIBLE	2025-11-03 19:21:01.633919	\N	\N	2025-11-03 19:21:01.633919	f
68	7	1	\N	\N	1000327	http://localhost:5173/verificar/OBL-1000327-18eac7cf7f194c1a	DISPONIBLE	2025-11-03 19:21:01.633919	\N	\N	2025-11-03 19:21:01.633919	f
70	7	1	\N	\N	1000329	http://localhost:5173/verificar/OBL-1000329-efd6b5fed052bdd9	DISPONIBLE	2025-11-03 19:21:01.633919	\N	\N	2025-11-03 19:21:01.633919	f
71	7	1	\N	\N	1000330	http://localhost:5173/verificar/OBL-1000330-f4ab08ba6b3387f8	DISPONIBLE	2025-11-03 19:21:01.633919	\N	\N	2025-11-03 19:21:01.633919	f
14	1	1	1	9	1000003	http://localhost:5173/verificar/OBL-1000003-b4dfd068b1d1da5f	ASIGNADA	2025-11-02 22:22:23.695837	2025-11-03 20:43:58.281	\N	2025-11-03 23:43:58.284186	t
3	2	1	2	\N	1000102	http://localhost:5173/verificar/OBL-1000102-91c8ef45f74f7cc6	DISPONIBLE	2025-11-02 22:22:23.667653	\N	\N	2025-11-02 22:22:23.667653	f
7	2	1	2	\N	1000106	http://localhost:5173/verificar/OBL-1000106-62684773eb36228b	DISPONIBLE	2025-11-02 22:22:23.679952	\N	\N	2025-11-02 22:22:23.679952	f
10	2	1	2	\N	1000109	http://localhost:5173/verificar/OBL-1000109-d973183d4a5eb1e9	DISPONIBLE	2025-11-02 22:22:23.685532	\N	\N	2025-11-02 22:22:23.685532	f
17	1	1	1	\N	1000006	http://localhost:5173/verificar/OBL-1000006-2592a2602f8ba5e6	DISPONIBLE	2025-11-02 22:22:23.70155	\N	\N	2025-11-02 22:22:23.70155	f
20	1	1	1	\N	1000009	http://localhost:5173/verificar/OBL-1000009-82515c8c1799b3dd	DISPONIBLE	2025-11-02 22:22:23.70954	\N	\N	2025-11-02 22:22:23.70954	f
24	4	2	4	\N	2000003	http://localhost:5173/verificar/OBL-2000003-fd110e392c129dcf	DISPONIBLE	2025-11-02 22:22:23.717897	\N	\N	2025-11-02 22:22:23.717897	f
27	4	2	4	\N	2000006	http://localhost:5173/verificar/OBL-2000006-0193136ba527d5aa	DISPONIBLE	2025-11-02 22:22:23.725897	\N	\N	2025-11-02 22:22:23.725897	f
30	4	2	4	\N	2000009	http://localhost:5173/verificar/OBL-2000009-134489c97cee13a1	DISPONIBLE	2025-11-02 22:22:23.733009	\N	\N	2025-11-02 22:22:23.733009	f
34	6	3	6	\N	3000003	http://localhost:5173/verificar/OBL-3000003-e3030af6d76bbf9d	DISPONIBLE	2025-11-02 22:22:23.743817	\N	\N	2025-11-02 22:22:23.743817	f
37	6	3	6	\N	3000006	http://localhost:5173/verificar/OBL-3000006-bd0b30b37ffe2c31	DISPONIBLE	2025-11-02 22:22:23.751286	\N	\N	2025-11-02 22:22:23.751286	f
41	7	1	\N	\N	1000300	http://localhost:5173/verificar/OBL-1000300-650f0611ef521d2c	DISPONIBLE	2025-11-03 19:21:01.633919	\N	\N	2025-11-03 19:21:01.633919	f
44	7	1	\N	\N	1000303	http://localhost:5173/verificar/OBL-1000303-5e9932a524dcc35c	DISPONIBLE	2025-11-03 19:21:01.633919	\N	\N	2025-11-03 19:21:01.633919	f
49	7	1	\N	\N	1000308	http://localhost:5173/verificar/OBL-1000308-cd92f1476c3f5f6b	DISPONIBLE	2025-11-03 19:21:01.633919	\N	\N	2025-11-03 19:21:01.633919	f
53	7	1	\N	\N	1000312	http://localhost:5173/verificar/OBL-1000312-158a6865a0e3ddb2	DISPONIBLE	2025-11-03 19:21:01.633919	\N	\N	2025-11-03 19:21:01.633919	f
57	7	1	\N	\N	1000316	http://localhost:5173/verificar/OBL-1000316-fb85ed03712816c5	DISPONIBLE	2025-11-03 19:21:01.633919	\N	\N	2025-11-03 19:21:01.633919	f
61	7	1	\N	\N	1000320	http://localhost:5173/verificar/OBL-1000320-75878bf371774b69	DISPONIBLE	2025-11-03 19:21:01.633919	\N	\N	2025-11-03 19:21:01.633919	f
65	7	1	\N	\N	1000324	http://localhost:5173/verificar/OBL-1000324-09c856a1aecf5a6c	DISPONIBLE	2025-11-03 19:21:01.633919	\N	\N	2025-11-03 19:21:01.633919	f
69	7	1	\N	\N	1000328	http://localhost:5173/verificar/OBL-1000328-3d04cef8e51de6d1	DISPONIBLE	2025-11-03 19:21:01.633919	\N	\N	2025-11-03 19:21:01.633919	f
72	7	1	\N	\N	1000331	http://localhost:5173/verificar/OBL-1000331-ef6b05c4c2c56cd5	DISPONIBLE	2025-11-03 19:21:01.633919	\N	\N	2025-11-03 19:21:01.633919	f
73	7	1	\N	\N	1000332	http://localhost:5173/verificar/OBL-1000332-207b03f0f6133dd8	DISPONIBLE	2025-11-03 19:21:01.633919	\N	\N	2025-11-03 19:21:01.633919	f
74	7	1	\N	\N	1000333	http://localhost:5173/verificar/OBL-1000333-62b2fd8e196589fc	DISPONIBLE	2025-11-03 19:21:01.633919	\N	\N	2025-11-03 19:21:01.633919	f
75	7	1	\N	\N	1000334	http://localhost:5173/verificar/OBL-1000334-8f54da4c0db60a18	DISPONIBLE	2025-11-03 19:21:01.633919	\N	\N	2025-11-03 19:21:01.633919	f
76	7	1	\N	\N	1000335	http://localhost:5173/verificar/OBL-1000335-cf6b52a1412b317f	DISPONIBLE	2025-11-03 19:21:01.633919	\N	\N	2025-11-03 19:21:01.633919	f
77	7	1	\N	\N	1000336	http://localhost:5173/verificar/OBL-1000336-a23d3cbd241d877a	DISPONIBLE	2025-11-03 19:21:01.633919	\N	\N	2025-11-03 19:21:01.633919	f
78	7	1	\N	\N	1000337	http://localhost:5173/verificar/OBL-1000337-bfab136b876723c5	DISPONIBLE	2025-11-03 19:21:01.633919	\N	\N	2025-11-03 19:21:01.633919	f
79	7	1	\N	\N	1000338	http://localhost:5173/verificar/OBL-1000338-50aee4bc837907db	DISPONIBLE	2025-11-03 19:21:01.633919	\N	\N	2025-11-03 19:21:01.633919	f
80	7	1	\N	\N	1000339	http://localhost:5173/verificar/OBL-1000339-78fdf8de7ef25719	DISPONIBLE	2025-11-03 19:21:01.633919	\N	\N	2025-11-03 19:21:01.633919	f
81	7	1	\N	\N	1000340	http://localhost:5173/verificar/OBL-1000340-842037507192ab73	DISPONIBLE	2025-11-03 19:21:01.633919	\N	\N	2025-11-03 19:21:01.633919	f
82	7	1	\N	\N	1000341	http://localhost:5173/verificar/OBL-1000341-5fca3057b082405e	DISPONIBLE	2025-11-03 19:21:01.633919	\N	\N	2025-11-03 19:21:01.633919	f
83	7	1	\N	\N	1000342	http://localhost:5173/verificar/OBL-1000342-a799527ab9b14e66	DISPONIBLE	2025-11-03 19:21:01.633919	\N	\N	2025-11-03 19:21:01.633919	f
84	7	1	\N	\N	1000343	http://localhost:5173/verificar/OBL-1000343-4b94cf8bce9fb27d	DISPONIBLE	2025-11-03 19:21:01.633919	\N	\N	2025-11-03 19:21:01.633919	f
85	7	1	\N	\N	1000344	http://localhost:5173/verificar/OBL-1000344-590d18d491d27bbd	DISPONIBLE	2025-11-03 19:21:01.633919	\N	\N	2025-11-03 19:21:01.633919	f
86	7	1	\N	\N	1000345	http://localhost:5173/verificar/OBL-1000345-ed269765c22dda0a	DISPONIBLE	2025-11-03 19:21:01.633919	\N	\N	2025-11-03 19:21:01.633919	f
87	7	1	\N	\N	1000346	http://localhost:5173/verificar/OBL-1000346-b5019620820f48e6	DISPONIBLE	2025-11-03 19:21:01.633919	\N	\N	2025-11-03 19:21:01.633919	f
88	7	1	\N	\N	1000347	http://localhost:5173/verificar/OBL-1000347-e3f9655b88599542	DISPONIBLE	2025-11-03 19:21:01.633919	\N	\N	2025-11-03 19:21:01.633919	f
89	7	1	\N	\N	1000348	http://localhost:5173/verificar/OBL-1000348-ad0625ced49b0dd7	DISPONIBLE	2025-11-03 19:21:01.633919	\N	\N	2025-11-03 19:21:01.633919	f
90	7	1	\N	\N	1000349	http://localhost:5173/verificar/OBL-1000349-ff9fe30071139200	DISPONIBLE	2025-11-03 19:21:01.633919	\N	\N	2025-11-03 19:21:01.633919	f
\.


--
-- Data for Name: payments; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.payments (id, "subscriptionId", "mercadopagoPaymentId", status, amount, currency, "paymentMethod", "paidAt", metadata, "createdAt") FROM stdin;
\.


--
-- Data for Name: plantas; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.plantas (id, "camaraId", "municipioId", nombre, cuit, direccion, "codigoHabilitacion", telefono, email, activa, "createdAt", "updatedAt") FROM stdin;
1	1	1	VTV Salta Centro	\N	Ruta 51 Km 3.5, Salta Capital	VTV-SAL-001	+54 387 4567890	centro@vtvsalta.com.ar	t	2025-11-02 22:22:23.488284	2025-11-02 22:22:23.488284
2	1	1	VTV Salta Norte	\N	Av. Tavella 2500, Salta Capital	VTV-SAL-002	+54 387 4567891	norte@vtvsalta.com.ar	t	2025-11-02 22:22:23.492928	2025-11-02 22:22:23.492928
3	1	2	VTV Orán	\N	Ruta 34 Km 1490, San Ramón de la Nueva Orán	VTV-ORA-001	+54 3878 421000	contacto@vtvoran.com.ar	t	2025-11-02 22:22:23.495596	2025-11-02 22:22:23.495596
4	2	6	RTO Córdoba Centro	\N	Av. Circunvalación Km 10, Córdoba	RTO-CBA-001	+54 351 4567890	centro@rtocordoba.com.ar	t	2025-11-02 22:22:23.498351	2025-11-02 22:22:23.498351
5	2	7	RTO Villa María	\N	Ruta 9 Km 558, Villa María	RTO-CBA-002	+54 353 4561234	info@rtovmaria.com.ar	t	2025-11-02 22:22:23.501473	2025-11-02 22:22:23.501473
6	3	9	VTV Tucumán Centro	\N	Av. Juan B. Justo 2345, San Miguel de Tucumán	VTV-TUC-001	+54 381 4123456	contacto@vtvtucuman.com.ar	t	2025-11-02 22:22:23.504598	2025-11-02 22:22:23.504598
\.


--
-- Data for Name: revisiones; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.revisiones (id, "plantaId", "vehiculoId", "oleaId", "usuarioId", resultado, "fechaRevision", "fechaVencimiento", observaciones, "urlFoto", kilometraje, "createdAt", "updatedAt") FROM stdin;
1	1	1	11	3	APROBADO	2025-11-02 19:30:56.323	2026-11-02 19:30:56.323	dd	\N	3.00	2025-11-02 22:30:56.324825	2025-11-02 22:31:08.724067
2	1	2	12	3	APROBADO	2025-11-03 16:00:19.821	2026-11-03 16:00:19.821	En perfecto estado	\N	20000.00	2025-11-03 19:00:19.822218	2025-11-03 19:00:47.891799
3	2	3	\N	5	APROBADO	2025-11-03 16:43:24.01	2026-11-03 16:43:24.01	era bueno	\N	12000.00	2025-11-03 19:43:24.011447	2025-11-03 19:43:24.011447
4	1	4	13	3	APROBADO	2025-11-03 16:50:56.6	2026-11-03 16:50:56.6	pepin	\N	12000.00	2025-11-03 19:50:56.601576	2025-11-03 19:58:05.568639
5	1	5	\N	3	CONDICIONAL	2025-11-03 17:22:02.791	2026-01-02 17:22:02.791	t	\N	3000.00	2025-11-03 20:22:02.792764	2025-11-03 20:22:02.792764
6	1	6	\N	3	CONDICIONAL	2025-11-03 17:37:55.368	2026-01-02 17:37:55.368	pepito	\N	3000.00	2025-11-03 20:37:55.369448	2025-11-03 20:37:55.369448
7	1	7	\N	3	CONDICIONAL	2025-11-03 17:43:24.476	2026-01-02 17:43:24.476	pepote	\N	45000.00	2025-11-03 20:43:24.477214	2025-11-03 20:43:24.477214
8	1	8	\N	3	CONDICIONAL	2025-11-03 18:03:09.362	2026-01-02 18:03:09.361	pepito	\N	3000.00	2025-11-03 21:03:09.363659	2025-11-03 21:03:09.363659
9	1	9	14	3	APROBADO	2025-11-03 20:35:45.427	2027-11-03 20:35:45.422	epa	\N	20000.00	2025-11-03 23:35:45.428094	2025-11-03 23:43:58.290255
\.


--
-- Data for Name: subscriptions; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.subscriptions (id, "plantaId", status, "billingPeriod", amount, "mercadopagoSubscriptionId", "mercadopagoCustomerId", "currentPeriodStart", "currentPeriodEnd", "trialEnd", "cancelledAt", "autoRenew", "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: tipos_vehiculo; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.tipos_vehiculo (id, nombre, descripcion, activo, "createdAt", "updatedAt") FROM stdin;
1	AUTOMOVIL	Vehículo de pasajeros estándar	t	2025-11-03 22:29:01.860055	2025-11-03 22:29:01.860055
\.


--
-- Data for Name: users; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.users (id, "camaraId", "plantaId", "municipioId", username, email, nombre, password, role, activo, "createdAt", "updatedAt") FROM stdin;
1	1	\N	\N	admin.salta	admin@camarasalta.gob.ar	\N	$2b$10$9ZSXN9rMxO4/lqPcetBlL.zZk.bcYcCTNgeJa9OY16Z7LwzCDbl2m	CAMARA	t	2025-11-02 22:22:23.580323	2025-11-02 22:22:23.580323
2	\N	1	\N	admin.salta.centro	admin.salta.centro@vtvsalta.com.ar	\N	$2b$10$9ZSXN9rMxO4/lqPcetBlL.zZk.bcYcCTNgeJa9OY16Z7LwzCDbl2m	PLANTA_ADMIN	t	2025-11-02 22:22:23.58501	2025-11-02 22:22:23.58501
3	\N	1	\N	operador.salta.centro	operador.salta.centro@vtvsalta.com.ar	\N	$2b$10$9ZSXN9rMxO4/lqPcetBlL.zZk.bcYcCTNgeJa9OY16Z7LwzCDbl2m	PLANTA_OPERADOR	t	2025-11-02 22:22:23.588456	2025-11-02 22:22:23.588456
4	\N	2	\N	admin.salta.norte	admin.salta.norte@vtvsalta.com.ar	\N	$2b$10$9ZSXN9rMxO4/lqPcetBlL.zZk.bcYcCTNgeJa9OY16Z7LwzCDbl2m	PLANTA_ADMIN	t	2025-11-02 22:22:23.592635	2025-11-02 22:22:23.592635
5	\N	2	\N	operador.salta.norte	operador.salta.norte@vtvsalta.com.ar	\N	$2b$10$9ZSXN9rMxO4/lqPcetBlL.zZk.bcYcCTNgeJa9OY16Z7LwzCDbl2m	PLANTA_OPERADOR	t	2025-11-02 22:22:23.595368	2025-11-02 22:22:23.595368
6	\N	3	\N	admin.salta.oran	admin.salta.oran@vtvoran.com.ar	\N	$2b$10$9ZSXN9rMxO4/lqPcetBlL.zZk.bcYcCTNgeJa9OY16Z7LwzCDbl2m	PLANTA_ADMIN	t	2025-11-02 22:22:23.598184	2025-11-02 22:22:23.598184
7	\N	3	\N	operador.salta.oran	operador.salta.oran@vtvoran.com.ar	\N	$2b$10$9ZSXN9rMxO4/lqPcetBlL.zZk.bcYcCTNgeJa9OY16Z7LwzCDbl2m	PLANTA_OPERADOR	t	2025-11-02 22:22:23.600606	2025-11-02 22:22:23.600606
8	\N	\N	1	fiscal.salta	fiscal@saltacapital.gob.ar	\N	$2b$10$9ZSXN9rMxO4/lqPcetBlL.zZk.bcYcCTNgeJa9OY16Z7LwzCDbl2m	MUNICIPIO	t	2025-11-02 22:22:23.603039	2025-11-02 22:22:23.603039
9	2	\N	\N	admin.cordoba	admin@camaracordoba.org.ar	\N	$2b$10$9ZSXN9rMxO4/lqPcetBlL.zZk.bcYcCTNgeJa9OY16Z7LwzCDbl2m	CAMARA	t	2025-11-02 22:22:23.606914	2025-11-02 22:22:23.606914
10	\N	4	\N	admin.cordoba.centro	admin.cordoba.centro@rtocordoba.com.ar	\N	$2b$10$9ZSXN9rMxO4/lqPcetBlL.zZk.bcYcCTNgeJa9OY16Z7LwzCDbl2m	PLANTA_ADMIN	t	2025-11-02 22:22:23.60987	2025-11-02 22:22:23.60987
11	\N	4	\N	operador.cordoba.centro	operador.cordoba.centro@rtocordoba.com.ar	\N	$2b$10$9ZSXN9rMxO4/lqPcetBlL.zZk.bcYcCTNgeJa9OY16Z7LwzCDbl2m	PLANTA_OPERADOR	t	2025-11-02 22:22:23.612521	2025-11-02 22:22:23.612521
12	\N	5	\N	admin.cordoba.villamaria	admin.cordoba.villamaria@rtovmaria.com.ar	\N	$2b$10$9ZSXN9rMxO4/lqPcetBlL.zZk.bcYcCTNgeJa9OY16Z7LwzCDbl2m	PLANTA_ADMIN	t	2025-11-02 22:22:23.615338	2025-11-02 22:22:23.615338
13	\N	5	\N	operador.cordoba.villamaria	operador.cordoba.villamaria@rtovmaria.com.ar	\N	$2b$10$9ZSXN9rMxO4/lqPcetBlL.zZk.bcYcCTNgeJa9OY16Z7LwzCDbl2m	PLANTA_OPERADOR	t	2025-11-02 22:22:23.617765	2025-11-02 22:22:23.617765
14	\N	\N	6	fiscal.cordoba	fiscal@cordobacapital.gob.ar	\N	$2b$10$9ZSXN9rMxO4/lqPcetBlL.zZk.bcYcCTNgeJa9OY16Z7LwzCDbl2m	MUNICIPIO	t	2025-11-02 22:22:23.620289	2025-11-02 22:22:23.620289
15	3	\N	\N	admin.tucuman	admin@camaratucuman.gob.ar	\N	$2b$10$9ZSXN9rMxO4/lqPcetBlL.zZk.bcYcCTNgeJa9OY16Z7LwzCDbl2m	CAMARA	t	2025-11-02 22:22:23.624372	2025-11-02 22:22:23.624372
16	\N	6	\N	admin.tucuman.centro	admin.tucuman.centro@vtvtucuman.com.ar	\N	$2b$10$9ZSXN9rMxO4/lqPcetBlL.zZk.bcYcCTNgeJa9OY16Z7LwzCDbl2m	PLANTA_ADMIN	t	2025-11-02 22:22:23.62702	2025-11-02 22:22:23.62702
17	\N	6	\N	operador.tucuman.centro	operador.tucuman.centro@vtvtucuman.com.ar	\N	$2b$10$9ZSXN9rMxO4/lqPcetBlL.zZk.bcYcCTNgeJa9OY16Z7LwzCDbl2m	PLANTA_OPERADOR	t	2025-11-02 22:22:23.629086	2025-11-02 22:22:23.629086
18	\N	\N	9	fiscal.tucuman	fiscal@smtucuman.gob.ar	\N	$2b$10$9ZSXN9rMxO4/lqPcetBlL.zZk.bcYcCTNgeJa9OY16Z7LwzCDbl2m	MUNICIPIO	t	2025-11-02 22:22:23.631931	2025-11-02 22:22:23.631931
\.


--
-- Data for Name: vehiculos; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.vehiculos (id, dominio, marca, modelo, anio, tipo, combustible, "numeroMotor", "numeroChasis", "createdAt", "updatedAt", "tipoVehiculoId", "fechaPrimeraMatriculacion") FROM stdin;
1	ABC123	t	t	2025	AUTOMOVIL	NAFTA	33	44	2025-11-02 22:30:32.066753	2025-11-02 22:30:32.066753	\N	\N
2	AF012!H	Toyota	Etios	2023	AUTOMOVIL	NAFTA	2349049	29049404	2025-11-03 18:59:48.247938	2025-11-03 18:59:48.247938	\N	\N
3	AA670YQ	Renault	Sandero	2025	AUTOMOVIL	NAFTA	234234234	234324234	2025-11-03 19:42:57.981713	2025-11-03 19:42:57.981713	\N	\N
4	AB485JK	marca	modelo	2025	AUTOMOVIL	NAFTA	2344234	23423423	2025-11-03 19:50:38.428035	2025-11-03 19:50:38.428035	\N	\N
5	AA333KD	marcatest	modelotest	2025	AUTOMOVIL	NAFTA	2342342	324234	2025-11-03 20:21:38.629781	2025-11-03 20:21:38.629781	\N	\N
6	HD857NV	nuevo	nuevo	2025	AUTOMOVIL	NAFTA	234324	234234	2025-11-03 20:37:32.823795	2025-11-03 20:37:32.823795	\N	\N
7	NV989NV	test2	test2	2025	AUTOMOVIL	NAFTA	234234	234324	2025-11-03 20:42:59.722691	2025-11-03 20:42:59.722691	\N	\N
8	AN485JH	test3	test3	2025	AUTOMOVIL	NAFTA	23423432	23423432	2025-11-03 21:02:48.609659	2025-11-03 22:41:13.786929	1	2017-11-03
9	AA111AA	toyota	yaris	2018	\N	NAFTA	32434	2343	2025-11-03 23:34:56.185608	2025-11-03 23:34:56.185608	1	2018-11-01
\.


--
-- Name: bloques_obleas_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.bloques_obleas_id_seq', 7, true);


--
-- Name: camaras_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.camaras_id_seq', 3, true);


--
-- Name: certificados_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.certificados_id_seq', 8, true);


--
-- Name: municipios_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.municipios_id_seq', 10, true);


--
-- Name: obleas_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.obleas_id_seq', 90, true);


--
-- Name: payments_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.payments_id_seq', 1, false);


--
-- Name: plantas_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.plantas_id_seq', 6, true);


--
-- Name: revisiones_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.revisiones_id_seq', 9, true);


--
-- Name: subscriptions_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.subscriptions_id_seq', 1, false);


--
-- Name: tipos_vehiculo_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.tipos_vehiculo_id_seq', 1, true);


--
-- Name: users_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.users_id_seq', 18, true);


--
-- Name: vehiculos_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.vehiculos_id_seq', 9, true);


--
-- Name: bloques_obleas PK_021b684986a046e5e925c6f1ddc; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.bloques_obleas
    ADD CONSTRAINT "PK_021b684986a046e5e925c6f1ddc" PRIMARY KEY (id);


--
-- Name: municipios PK_10d04b4b4e39ba40240b61e919d; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.municipios
    ADD CONSTRAINT "PK_10d04b4b4e39ba40240b61e919d" PRIMARY KEY (id);


--
-- Name: payments PK_197ab7af18c93fbb0c9b28b4a59; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.payments
    ADD CONSTRAINT "PK_197ab7af18c93fbb0c9b28b4a59" PRIMARY KEY (id);


--
-- Name: obleas PK_3b76b7f358755f77318988f1833; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.obleas
    ADD CONSTRAINT "PK_3b76b7f358755f77318988f1833" PRIMARY KEY (id);


--
-- Name: plantas PK_7ae4f0f3ac4d583495b785b5761; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.plantas
    ADD CONSTRAINT "PK_7ae4f0f3ac4d583495b785b5761" PRIMARY KEY (id);


--
-- Name: revisiones PK_7debeb2acc63fbba56023a922be; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.revisiones
    ADD CONSTRAINT "PK_7debeb2acc63fbba56023a922be" PRIMARY KEY (id);


--
-- Name: camaras PK_9c0ca0dd2ed1835b925992ce59b; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.camaras
    ADD CONSTRAINT "PK_9c0ca0dd2ed1835b925992ce59b" PRIMARY KEY (id);


--
-- Name: users PK_a3ffb1c0c8416b9fc6f907b7433; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT "PK_a3ffb1c0c8416b9fc6f907b7433" PRIMARY KEY (id);


--
-- Name: subscriptions PK_a87248d73155605cf782be9ee5e; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.subscriptions
    ADD CONSTRAINT "PK_a87248d73155605cf782be9ee5e" PRIMARY KEY (id);


--
-- Name: vehiculos PK_bc0b75baae377e599cd46b502e1; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.vehiculos
    ADD CONSTRAINT "PK_bc0b75baae377e599cd46b502e1" PRIMARY KEY (id);


--
-- Name: tipos_vehiculo PK_e6238f9d960a7784d6ad7b3490e; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.tipos_vehiculo
    ADD CONSTRAINT "PK_e6238f9d960a7784d6ad7b3490e" PRIMARY KEY (id);


--
-- Name: certificados PK_e9b232ca7a16db08667f021708f; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.certificados
    ADD CONSTRAINT "PK_e9b232ca7a16db08667f021708f" PRIMARY KEY (id);


--
-- Name: certificados UQ_2d6e56deda8557c7ba05726d8c5; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.certificados
    ADD CONSTRAINT "UQ_2d6e56deda8557c7ba05726d8c5" UNIQUE ("numeroCertificado");


--
-- Name: certificados UQ_32b8b45417a575c0cab75176f15; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.certificados
    ADD CONSTRAINT "UQ_32b8b45417a575c0cab75176f15" UNIQUE ("oleaId");


--
-- Name: camaras UQ_3755965c3d4760bc314955e7a8f; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.camaras
    ADD CONSTRAINT "UQ_3755965c3d4760bc314955e7a8f" UNIQUE (codigo);


--
-- Name: camaras UQ_444e4963beb8edcf03d0cb9618b; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.camaras
    ADD CONSTRAINT "UQ_444e4963beb8edcf03d0cb9618b" UNIQUE (cuit);


--
-- Name: obleas UQ_70b5f3f8be60c6331f1c408bbb3; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.obleas
    ADD CONSTRAINT "UQ_70b5f3f8be60c6331f1c408bbb3" UNIQUE ("codigoQr");


--
-- Name: certificados UQ_75095ffd017e155d4a7e92b6b3d; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.certificados
    ADD CONSTRAINT "UQ_75095ffd017e155d4a7e92b6b3d" UNIQUE ("revisionId");


--
-- Name: obleas UQ_79ab7d14842ea7a96f0b96d3de0; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.obleas
    ADD CONSTRAINT "UQ_79ab7d14842ea7a96f0b96d3de0" UNIQUE (numero);


--
-- Name: vehiculos UQ_7c11284e3ce97494f3f2e69477e; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.vehiculos
    ADD CONSTRAINT "UQ_7c11284e3ce97494f3f2e69477e" UNIQUE (dominio);


--
-- Name: bloques_obleas UQ_806d0a8f20d4597b9e4841147b4; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.bloques_obleas
    ADD CONSTRAINT "UQ_806d0a8f20d4597b9e4841147b4" UNIQUE (codigo);


--
-- Name: plantas UQ_9058062c42b1c0e64aa1ec7463d; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.plantas
    ADD CONSTRAINT "UQ_9058062c42b1c0e64aa1ec7463d" UNIQUE ("codigoHabilitacion");


--
-- Name: users UQ_97672ac88f789774dd47f7c8be3; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT "UQ_97672ac88f789774dd47f7c8be3" UNIQUE (email);


--
-- Name: certificados UQ_c7591eafe7b0918f76249439ef9; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.certificados
    ADD CONSTRAINT "UQ_c7591eafe7b0918f76249439ef9" UNIQUE ("codigoQr");


--
-- Name: municipios UQ_ca61f54e17be66859316ac5d87b; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.municipios
    ADD CONSTRAINT "UQ_ca61f54e17be66859316ac5d87b" UNIQUE (codigo);


--
-- Name: tipos_vehiculo UQ_e45219bf25cdb1ef3d4dbc1b3f1; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.tipos_vehiculo
    ADD CONSTRAINT "UQ_e45219bf25cdb1ef3d4dbc1b3f1" UNIQUE (nombre);


--
-- Name: users UQ_fe0bb3f6520ee0469504521e710; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT "UQ_fe0bb3f6520ee0469504521e710" UNIQUE (username);


--
-- Name: IDX_2d6e56deda8557c7ba05726d8c; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "IDX_2d6e56deda8557c7ba05726d8c" ON public.certificados USING btree ("numeroCertificado");


--
-- Name: IDX_70b5f3f8be60c6331f1c408bbb; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "IDX_70b5f3f8be60c6331f1c408bbb" ON public.obleas USING btree ("codigoQr");


--
-- Name: IDX_79ab7d14842ea7a96f0b96d3de; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "IDX_79ab7d14842ea7a96f0b96d3de" ON public.obleas USING btree (numero);


--
-- Name: IDX_7c11284e3ce97494f3f2e69477; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "IDX_7c11284e3ce97494f3f2e69477" ON public.vehiculos USING btree (dominio);


--
-- Name: IDX_97672ac88f789774dd47f7c8be; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "IDX_97672ac88f789774dd47f7c8be" ON public.users USING btree (email);


--
-- Name: IDX_c7591eafe7b0918f76249439ef; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "IDX_c7591eafe7b0918f76249439ef" ON public.certificados USING btree ("codigoQr");


--
-- Name: IDX_fe0bb3f6520ee0469504521e71; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "IDX_fe0bb3f6520ee0469504521e71" ON public.users USING btree (username);


--
-- Name: users FK_1228f81c51d76529e7be973498f; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT "FK_1228f81c51d76529e7be973498f" FOREIGN KEY ("municipioId") REFERENCES public.municipios(id);


--
-- Name: bloques_obleas FK_1ec065e2fbee59d7647a512a3d6; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.bloques_obleas
    ADD CONSTRAINT "FK_1ec065e2fbee59d7647a512a3d6" FOREIGN KEY ("camaraId") REFERENCES public.camaras(id);


--
-- Name: payments FK_2017d0cbfdbfec6b1b388e6aa08; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.payments
    ADD CONSTRAINT "FK_2017d0cbfdbfec6b1b388e6aa08" FOREIGN KEY ("subscriptionId") REFERENCES public.subscriptions(id);


--
-- Name: revisiones FK_2d26c7b319716fdf7237c9e3f3a; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.revisiones
    ADD CONSTRAINT "FK_2d26c7b319716fdf7237c9e3f3a" FOREIGN KEY ("usuarioId") REFERENCES public.users(id);


--
-- Name: certificados FK_32b8b45417a575c0cab75176f15; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.certificados
    ADD CONSTRAINT "FK_32b8b45417a575c0cab75176f15" FOREIGN KEY ("oleaId") REFERENCES public.obleas(id);


--
-- Name: vehiculos FK_337bd306a1bc97d308adfe2574f; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.vehiculos
    ADD CONSTRAINT "FK_337bd306a1bc97d308adfe2574f" FOREIGN KEY ("tipoVehiculoId") REFERENCES public.tipos_vehiculo(id);


--
-- Name: users FK_359d8c48c1623f1b7b3cea6121a; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT "FK_359d8c48c1623f1b7b3cea6121a" FOREIGN KEY ("plantaId") REFERENCES public.plantas(id);


--
-- Name: obleas FK_625237af1fd27377bb890c0ce2a; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.obleas
    ADD CONSTRAINT "FK_625237af1fd27377bb890c0ce2a" FOREIGN KEY ("plantaId") REFERENCES public.plantas(id);


--
-- Name: plantas FK_6617cbce2c59d7dd7ab385e19e4; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.plantas
    ADD CONSTRAINT "FK_6617cbce2c59d7dd7ab385e19e4" FOREIGN KEY ("camaraId") REFERENCES public.camaras(id);


--
-- Name: municipios FK_67075bad8e7004eebd259a4fea7; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.municipios
    ADD CONSTRAINT "FK_67075bad8e7004eebd259a4fea7" FOREIGN KEY ("camaraId") REFERENCES public.camaras(id);


--
-- Name: certificados FK_75095ffd017e155d4a7e92b6b3d; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.certificados
    ADD CONSTRAINT "FK_75095ffd017e155d4a7e92b6b3d" FOREIGN KEY ("revisionId") REFERENCES public.revisiones(id);


--
-- Name: plantas FK_b4811f1af942b1d29b53c967304; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.plantas
    ADD CONSTRAINT "FK_b4811f1af942b1d29b53c967304" FOREIGN KEY ("municipioId") REFERENCES public.municipios(id);


--
-- Name: users FK_c2bcff0413d8b089297b9a4d389; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT "FK_c2bcff0413d8b089297b9a4d389" FOREIGN KEY ("camaraId") REFERENCES public.camaras(id);


--
-- Name: obleas FK_d6e94bb29a22bf76c2e7e0a9de7; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.obleas
    ADD CONSTRAINT "FK_d6e94bb29a22bf76c2e7e0a9de7" FOREIGN KEY ("bloqueId") REFERENCES public.bloques_obleas(id);


--
-- Name: bloques_obleas FK_d925294799a98aaf0fbf37b5bb2; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.bloques_obleas
    ADD CONSTRAINT "FK_d925294799a98aaf0fbf37b5bb2" FOREIGN KEY ("plantaId") REFERENCES public.plantas(id);


--
-- Name: revisiones FK_df95fa5670bc60fd10fc6540a2c; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.revisiones
    ADD CONSTRAINT "FK_df95fa5670bc60fd10fc6540a2c" FOREIGN KEY ("vehiculoId") REFERENCES public.vehiculos(id);


--
-- Name: revisiones FK_e198e20293c8f98439aaaea07f1; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.revisiones
    ADD CONSTRAINT "FK_e198e20293c8f98439aaaea07f1" FOREIGN KEY ("oleaId") REFERENCES public.obleas(id);


--
-- Name: subscriptions FK_f07fcc6dd9b5444a9d456d96d15; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.subscriptions
    ADD CONSTRAINT "FK_f07fcc6dd9b5444a9d456d96d15" FOREIGN KEY ("plantaId") REFERENCES public.plantas(id);


--
-- Name: revisiones FK_ffd0b345c07d2dbe7d61025c659; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.revisiones
    ADD CONSTRAINT "FK_ffd0b345c07d2dbe7d61025c659" FOREIGN KEY ("plantaId") REFERENCES public.plantas(id);


--
-- PostgreSQL database dump complete
--

\unrestrict zLyUUESNZzkGWpWvC7k9MMhdJx9P4Lxtj5YbtJyOERew8u4hc185fyg0WgKrMQq

