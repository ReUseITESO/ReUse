from django.core.management.base import BaseCommand
from marketplace.models.category import Category
from marketplace.models.product import Products
from core.models.user import User


CATEGORIES = [
    {"name": "Libros",        "icon": "book"},
    {"name": "Electrónica",   "icon": "laptop"},
    {"name": "Ropa ITESO",    "icon": "shirt"},
    {"name": "Calculadoras",  "icon": "calculator"},
    {"name": "Apuntes",       "icon": "file-text"},
    {"name": "Deportes",      "icon": "dumbbell"},
    {"name": "Muebles",       "icon": "sofa"},
]

USERS = [
    {"name": "Lucía Fernández Gómez",    "email": "lucia.fernandez@iteso.mx",   "phone": "3311223344"},
    {"name": "Carlos Rodríguez Torres",  "email": "carlos.rodriguez@iteso.mx",  "phone": "3322334455"},
    {"name": "Ana García López",         "email": "ana.garcia@iteso.mx",        "phone": "3333445566"},
    {"name": "Miguel Hernández Ruiz",    "email": "miguel.hernandez@iteso.mx",  "phone": "3344556677"},
    {"name": "Sofía Martínez Castro",    "email": "sofia.martinez@iteso.mx",    "phone": "3355667788"},
]

# (title, description, condition, transaction_type, price, image_url, category_name, seller_email)
PRODUCTS = [
    # ── Libros ──────────────────────────────────────────────────────────────────
    (
        "Colección 5 Libros Arquitectura",
        "Colección de 5 libros de teoría arquitectónica. Le Corbusier, Rem Koolhaas y otros.",
        "buen_estado", "sale", "600.00",
        "https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=500",
        "Libros", "lucia.fernandez@iteso.mx",
    ),
    (
        "Fundamentos de Marketing – Kotler",
        "Busco intercambiar este libro por uno de Contabilidad o Finanzas. Buen estado, 13va edición.",
        "buen_estado", "swap", None,
        "https://images.unsplash.com/photo-1512820790803-83ca734da794?w=500",
        "Libros", "carlos.rodriguez@iteso.mx",
    ),
    (
        "Cálculo – James Stewart 8va Ed.",
        "Libro de Cálculo diferencial e integral, algunas notas a lápiz. Muy buen estado.",
        "como_nuevo", "sale", "350.00",
        "https://images.unsplash.com/photo-1509228468518-180dd4864904?w=500",
        "Libros", "ana.garcia@iteso.mx",
    ),
    (
        "Introducción a la Economía – Mankiw",
        "Edición en español, sin subrayados. Ideal para primer semestre.",
        "buen_estado", "sale", "280.00",
        "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=500",
        "Libros", "sofia.martinez@iteso.mx",
    ),
    (
        "Pack Libros Ingeniería Industrial",
        "3 libros: Investigación de Operaciones, Estadística, Simulación. Se venden juntos o por separado.",
        "usado", "sale", "450.00",
        "https://images.unsplash.com/photo-1497633762265-9d179a990aa6?w=500",
        "Libros", "miguel.hernandez@iteso.mx",
    ),
    (
        "El Principito – Antoine de Saint-Exupéry",
        "Edición especial ilustrada, como nuevo. Lo regalan con mucho cariño.",
        "como_nuevo", "donation", None,
        "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=500",
        "Libros", "lucia.fernandez@iteso.mx",
    ),

    # ── Electrónica ─────────────────────────────────────────────────────────────
    (
        "Mouse Logitech MX Master 3",
        "Mouse inalámbrico en excelente estado. Batería dura mucho. Incluye cable USB-C.",
        "buen_estado", "sale", "600.00",
        "https://images.unsplash.com/photo-1527814050687-3793815479db?w=500",
        "Electrónica", "carlos.rodriguez@iteso.mx",
    ),
    (
        "Teclado Mecánico Redragon K552",
        "Teclado mecánico gaming, switches azules. LED RGB funcional.",
        "buen_estado", "sale", "450.00",
        "https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=500",
        "Electrónica", "carlos.rodriguez@iteso.mx",
    ),
    (
        "Audífonos Sony WH-1000XM4",
        "Cancelación activa de ruido. Perfectos para estudiar. Incluye estuche original.",
        "como_nuevo", "sale", "2800.00",
        "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500",
        "Electrónica", "ana.garcia@iteso.mx",
    ),
    (
        "Laptop Lenovo IdeaPad 3 – i5 11va gen",
        "8 GB RAM, 512 GB SSD. Batería dura ~5 horas. Cargador incluido.",
        "buen_estado", "sale", "8500.00",
        "https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=500",
        "Electrónica", "sofia.martinez@iteso.mx",
    ),
    (
        "Tablet Samsung Galaxy Tab A8",
        "Con funda y stylus. Ideal para tomar apuntes en clases. Sin rayones.",
        "como_nuevo", "sale", "3200.00",
        "https://images.unsplash.com/photo-1585790050230-5dd28404ccb9?w=500",
        "Electrónica", "miguel.hernandez@iteso.mx",
    ),
    (
        "Monitor LG 24'' Full HD",
        "Monitor de 24 pulgadas, 75 Hz, IPS. Cable HDMI incluido. Funciona perfecto.",
        "buen_estado", "sale", "2200.00",
        "https://images.unsplash.com/photo-1527443224154-c4a573d5e078?w=500",
        "Electrónica", "lucia.fernandez@iteso.mx",
    ),

    # ── Calculadoras ────────────────────────────────────────────────────────────
    (
        "Calculadora Científica Casio fx-991LA Plus",
        "Casi nueva. Ideal para Cálculo, Física y Estadística. Incluye funda.",
        "como_nuevo", "sale", "380.00",
        "https://images.unsplash.com/photo-1611532736597-de2d4265fba3?w=500",
        "Calculadoras", "ana.garcia@iteso.mx",
    ),
    (
        "Calculadora Graficadora TI-84 Plus",
        "Con cargador. Perfecta para Ingeniería. Algunas rayones en la pantalla protegida.",
        "buen_estado", "sale", "1200.00",
        "https://images.unsplash.com/photo-1598300042247-d088f8ab3a91?w=500",
        "Calculadoras", "carlos.rodriguez@iteso.mx",
    ),
    (
        "Casio fx-570ES Plus – REGALO",
        "Ya no la necesito. Funciona al 100%, incluye pilas nuevas.",
        "buen_estado", "donation", None,
        "https://images.unsplash.com/photo-1611532736571-48ea0ac8f7d9?w=500",
        "Calculadoras", "sofia.martinez@iteso.mx",
    ),

    # ── Apuntes ─────────────────────────────────────────────────────────────────
    (
        "Apuntes Química Orgánica I – ITESO",
        "Apuntes completos del semestre, escaneados en PDF. Incluye ejercicios resueltos.",
        "nuevo", "sale", "80.00",
        "https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?w=500",
        "Apuntes", "miguel.hernandez@iteso.mx",
    ),
    (
        "Apuntes Estadística y Probabilidad",
        "Notas organizadas por tema con ejemplos y fórmulas. Formato impreso, espiral.",
        "buen_estado", "sale", "60.00",
        "https://images.unsplash.com/photo-1471107340929-a87cd0f5b5f3?w=500",
        "Apuntes", "lucia.fernandez@iteso.mx",
    ),
    (
        "Guía de Estudio Derecho Corporativo",
        "Resumen ejecutivo de todos los temas con casos prácticos ITESO. PDF editable.",
        "nuevo", "swap", None,
        "https://images.unsplash.com/photo-1450101499163-c8848c66ca85?w=500",
        "Apuntes", "ana.garcia@iteso.mx",
    ),

    # ── Ropa ITESO ──────────────────────────────────────────────────────────────
    (
        "Sudadera ITESO Gris – Talla M",
        "Original ITESO, usada una temporada. Muy buen estado, sin manchas ni rotos.",
        "buen_estado", "sale", "250.00",
        "https://images.unsplash.com/photo-1556821840-3a63f15732ce?w=500",
        "Ropa ITESO", "carlos.rodriguez@iteso.mx",
    ),
    (
        "Playera Polo ITESO Azul – Talla L",
        "Playera oficial del campus, talla L. Lavada y lista para usar.",
        "como_nuevo", "sale", "180.00",
        "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=500",
        "Ropa ITESO", "sofia.martinez@iteso.mx",
    ),
    (
        "Chamarra ITESO Edición Especial",
        "Chamarra de edición limitada del 50 aniversario ITESO. Talla S. Coleccionable.",
        "como_nuevo", "swap", None,
        "https://images.unsplash.com/photo-1591047139829-d91aecb6caea?w=500",
        "Ropa ITESO", "miguel.hernandez@iteso.mx",
    ),

    # ── Deportes ────────────────────────────────────────────────────────────────
    (
        "Raqueta de Tenis Wilson – Serie Tour",
        "Con funda, grip nuevo. Ideal para canchas del campus.",
        "buen_estado", "sale", "700.00",
        "https://images.unsplash.com/photo-1551698618-1dfe5d97d256?w=500",
        "Deportes", "lucia.fernandez@iteso.mx",
    ),
    (
        "Bicicleta de Montaña Raleigh R6",
        "Rodada 26, frenos de disco, 21 velocidades. Lista para usar.",
        "buen_estado", "sale", "3500.00",
        "https://images.unsplash.com/photo-1485965120184-e220f721d03e?w=500",
        "Deportes", "ana.garcia@iteso.mx",
    ),

    # ── Muebles ─────────────────────────────────────────────────────────────────
    (
        "Silla de Escritorio Ergonómica",
        "Ajustable en altura y respaldo lumbar. Perfecta para estudiar largas horas.",
        "buen_estado", "sale", "1500.00",
        "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=500",
        "Muebles", "carlos.rodriguez@iteso.mx",
    ),
    (
        "Escritorio de Madera 120 cm",
        "Con cajón y soporte para monitor. Desmontable para transporte.",
        "usado", "sale", "900.00",
        "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=500",
        "Muebles", "sofia.martinez@iteso.mx",
    ),
    # ── Más Libros ───────────────────────────────────────────────────────────
    (
        "Química General – Petrucci 10ma Ed.",
        "Con algunos subrayados a lápiz. Ideal para Química I y II.",
        "buen_estado", "sale", "320.00",
        "https://images.unsplash.com/photo-1532012197267-da84d127e765?w=500",
        "Libros", "miguel.hernandez@iteso.mx",
    ),
    (
        "Física Universitaria – Young Freedman Vol. 1",
        "Sin subrayados, bien conservado. Incluye acceso a recursos digitales.",
        "como_nuevo", "sale", "400.00",
        "https://images.unsplash.com/photo-1524995997946-a1c2e315a42f?w=500",
        "Libros", "sofia.martinez@iteso.mx",
    ),
    (
        "Administración – Robbins & Coulter 13va Ed.",
        "Usado dos semestres, en buen estado. Todas las páginas completas.",
        "usado", "swap", None,
        "https://images.unsplash.com/photo-1589829085413-56de8ae18c73?w=500",
        "Libros", "lucia.fernandez@iteso.mx",
    ),
    (
        "Contabilidad Financiera – Guajardo",
        "Edición más reciente. Perfecto para Contabilidad I. Sin anotaciones.",
        "nuevo", "sale", "450.00",
        "https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?w=500",
        "Libros", "carlos.rodriguez@iteso.mx",
    ),
    (
        "Diseño de Interiores – Francis Ching",
        "Libro con muchas ilustraciones técnicas. Excelente estado.",
        "buen_estado", "donation", None,
        "https://images.unsplash.com/photo-1497633762265-9d179a990aa6?w=500",
        "Libros", "ana.garcia@iteso.mx",
    ),

    # ── Más Electrónica ──────────────────────────────────────────────────────
    (
        "iPhone 13 – 128 GB Negro",
        "Con caja original, cargador y funda. Batería al 89%. Sin rayones.",
        "buen_estado", "sale", "9500.00",
        "https://images.unsplash.com/photo-1632661674596-df8be070a5c5?w=500",
        "Electrónica", "miguel.hernandez@iteso.mx",
    ),
    (
        "Nintendo Switch OLED – Blanca",
        "Con dos juegos: Mario Kart y Zelda. Dock y controles Joy-Con incluidos.",
        "como_nuevo", "sale", "7200.00",
        "https://images.unsplash.com/photo-1578303512597-81e6cc155b3e?w=500",
        "Electrónica", "sofia.martinez@iteso.mx",
    ),
    (
        "Webcam Logitech C920 HD",
        "1080p, ideal para videollamadas y streaming. Incluye soporte de clip.",
        "como_nuevo", "sale", "950.00",
        "https://images.unsplash.com/photo-1587826080692-f439cd0b70da?w=500",
        "Electrónica", "lucia.fernandez@iteso.mx",
    ),
    (
        "Cargador Inalámbrico Belkin 15W",
        "Compatible con iPhone y Android. Sin cable de alimentación.",
        "buen_estado", "sale", "280.00",
        "https://images.unsplash.com/photo-1618434816151-372d5c13131f?w=500",
        "Electrónica", "carlos.rodriguez@iteso.mx",
    ),
    (
        "Hub USB-C 7 en 1 – UGREEN",
        "HDMI 4K, USB 3.0 x3, SD, MicroSD, USB-C PD. Funciona perfecto.",
        "buen_estado", "sale", "420.00",
        "https://images.unsplash.com/photo-1625842268584-8f3296236761?w=500",
        "Electrónica", "ana.garcia@iteso.mx",
    ),

    # ── Más Calculadoras ─────────────────────────────────────────────────────
    (
        "HP 50g Calculadora Graficadora",
        "Con funda y manual. Ideal para Ingeniería. Pilas nuevas.",
        "buen_estado", "sale", "900.00",
        "https://images.unsplash.com/photo-1611532736597-de2d4265fba3?w=500",
        "Calculadoras", "miguel.hernandez@iteso.mx",
    ),
    (
        "Casio ClassPad II fx-CP400",
        "Pantalla táctil. Perfecta para álgebra simbólica. Incluye stylus.",
        "como_nuevo", "sale", "1800.00",
        "https://images.unsplash.com/photo-1568952433726-3896e3881c65?w=500",
        "Calculadoras", "lucia.fernandez@iteso.mx",
    ),

    # ── Más Apuntes ──────────────────────────────────────────────────────────
    (
        "Apuntes Cálculo Diferencial – ITESO",
        "Apuntes digitalizados, 80 páginas. Incluye ejercicios de exámenes anteriores.",
        "nuevo", "sale", "70.00",
        "https://images.unsplash.com/photo-1501504905252-473c47e087f8?w=500",
        "Apuntes", "carlos.rodriguez@iteso.mx",
    ),
    (
        "Resumen Ejecutivo Derecho Constitucional",
        "Todos los temas del semestre resumidos en 30 páginas. Digitalizado en PDF.",
        "nuevo", "donation", None,
        "https://images.unsplash.com/photo-1450101499163-c8848c66ca85?w=500",
        "Apuntes", "sofia.martinez@iteso.mx",
    ),
    (
        "Flashcards Anatomía Humana",
        "200 tarjetas impresas con ilustraciones. Perfectas para repasar.",
        "buen_estado", "sale", "120.00",
        "https://images.unsplash.com/photo-1434030216411-0b793f4b4173?w=500",
        "Apuntes", "ana.garcia@iteso.mx",
    ),

    # ── Más Ropa ITESO ───────────────────────────────────────────────────────
    (
        "Short Deportivo ITESO – Talla M",
        "Para usar en el Campus o cancha. Lavado y listo.",
        "buen_estado", "sale", "120.00",
        "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=500",
        "Ropa ITESO", "miguel.hernandez@iteso.mx",
    ),
    (
        "Hoodie ITESO Verde – Talla L",
        "Edición especial de ingeniería. Poco uso, sin desgaste.",
        "como_nuevo", "sale", "300.00",
        "https://images.unsplash.com/photo-1556821840-3a63f15732ce?w=500",
        "Ropa ITESO", "lucia.fernandez@iteso.mx",
    ),

    # ── Más Deportes ─────────────────────────────────────────────────────────
    (
        "Patines en Línea Rollerblade Talla 27",
        "Para niño/adolescente. Protecciones incluidas. En buen estado.",
        "buen_estado", "sale", "600.00",
        "https://images.unsplash.com/photo-1604671801908-6f0c6a092c05?w=500",
        "Deportes", "carlos.rodriguez@iteso.mx",
    ),
    (
        "Pelota de Fútbol Nike Premier League",
        "Talla 5, modelo oficial. Bien inflada, poca use.",
        "buen_estado", "donation", None,
        "https://images.unsplash.com/photo-1575361204480-aadea25e6e68?w=500",
        "Deportes", "sofia.martinez@iteso.mx",
    ),
    (
        "Mancuernas 5 kg par – NIKE",
        "Par de mancuernas de goma. Sin daños, ideales para rutina en casa.",
        "buen_estado", "sale", "350.00",
        "https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=500",
        "Deportes", "ana.garcia@iteso.mx",
    ),

    # ── Más Muebles ──────────────────────────────────────────────────────────
    (
        "Lámpara de Escritorio LED con USB",
        "Regulable en brillo y temperatura de color. Puerto USB integrado.",
        "nuevo", "sale", "380.00",
        "https://images.unsplash.com/photo-1507473885765-e6ed057f782c?w=500",
        "Muebles", "miguel.hernandez@iteso.mx",
    ),
    (
        "Repisa Flotante IKEA 80 cm",
        "Madera blanca, tornillos incluidos. Sin instalación previa.",
        "nuevo", "sale", "250.00",
        "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=500",
        "Muebles", "lucia.fernandez@iteso.mx",
    ),
    (
        "Organizador de Escritorio Bambú",
        "Con 5 compartimentos. Ideal para mantener el escritorio ordenado.",
        "como_nuevo", "sale", "150.00",
        "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=500",
        "Muebles", "carlos.rodriguez@iteso.mx",
    ),]


class Command(BaseCommand):
    help = "Poblar la base de datos con categorías, usuarios y productos de ejemplo."

    def handle(self, *args, **kwargs):
        self.stdout.write("=== Iniciando seed de datos ===\n")

        # ── Categorías ────────────────────────────────────────────────────────
        self.stdout.write("Creando categorías...")
        cat_map = {}
        for data in CATEGORIES:
            cat, created = Category.objects.get_or_create(
                name=data["name"],
                defaults={"icon": data["icon"]},
            )
            cat_map[cat.name] = cat
            status = "✓ creada" if created else "– ya existía"
            self.stdout.write(f"  {status}: {cat.name}")

        # ── Usuarios ──────────────────────────────────────────────────────────
        self.stdout.write("\nCreando usuarios...")
        user_map = {}
        for data in USERS:
            user, created = User.objects.get_or_create(
                email=data["email"],
                defaults={"name": data["name"], "phone": data["phone"]},
            )
            user_map[user.email] = user
            status = "✓ creado" if created else "– ya existía"
            self.stdout.write(f"  {status}: {user.name}")

        # ── Productos ─────────────────────────────────────────────────────────
        self.stdout.write("\nCreando productos...")
        created_count = 0
        skipped_count = 0
        for (title, desc, condition, tx_type, price, img, cat_name, seller_email) in PRODUCTS:
            category = cat_map.get(cat_name)
            seller = user_map.get(seller_email)
            if not category or not seller:
                self.stdout.write(
                    self.style.WARNING(f"  ⚠ Saltado '{title}': categoría o vendedor no encontrado.")
                )
                continue

            _, created = Products.objects.get_or_create(
                title=title,
                seller=seller,
                defaults={
                    "description": desc,
                    "condition": condition,
                    "transaction_type": tx_type,
                    "price": price,
                    "image_url": img,
                    "category": category,
                    "status": "disponible",
                },
            )
            if created:
                created_count += 1
                self.stdout.write(f"  ✓ creado: {title}")
            else:
                skipped_count += 1
                self.stdout.write(f"  – ya existía: {title}")

        self.stdout.write(
            self.style.SUCCESS(
                f"\n=== Seed completado: {created_count} productos creados, {skipped_count} ya existían. ==="
            )
        )
