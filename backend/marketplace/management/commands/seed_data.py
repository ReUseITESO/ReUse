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
    # -- Books --
    (
        "Colección 5 Libros Arquitectura",
        "Colección de 5 libros de teoría arquitectónica. Le Corbusier, Rem Koolhaas y otros.",
        "good", "sale", "600.00",
        "https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=500",
        "Libros", "lucia.fernandez@iteso.mx",
    ),
    (
        "Fundamentos de Marketing – Kotler",
        "Busco intercambiar este libro por uno de Contabilidad o Finanzas. Buen estado, 13va edición.",
        "good", "swap", None,
        "https://images.unsplash.com/photo-1512820790803-83ca734da794?w=500",
        "Libros", "carlos.rodriguez@iteso.mx",
    ),
    (
        "Cálculo – James Stewart 8va Ed.",
        "Libro de Cálculo diferencial e integral, algunas notas a lápiz. Muy buen estado.",
        "like_new", "sale", "350.00",
        "https://images.unsplash.com/photo-1509228468518-180dd4864904?w=500",
        "Libros", "ana.garcia@iteso.mx",
    ),
    (
        "Introducción a la Economía – Mankiw",
        "Edición en español, sin subrayados. Ideal para primer semestre.",
        "good", "sale", "280.00",
        "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=500",
        "Libros", "sofia.martinez@iteso.mx",
    ),
    (
        "Pack Libros Ingeniería Industrial",
        "3 libros: Investigación de Operaciones, Estadística, Simulación. Se venden juntos o por separado.",
        "used", "sale", "450.00",
        "https://images.unsplash.com/photo-1497633762265-9d179a990aa6?w=500",
        "Libros", "miguel.hernandez@iteso.mx",
    ),
    (
        "El Principito – Antoine de Saint-Exupéry",
        "Edición especial ilustrada, como nuevo. Lo regalan con mucho cariño.",
        "like_new", "donation", None,
        "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=500",
        "Libros", "lucia.fernandez@iteso.mx",
    ),

    # -- Electronics --
    (
        "Mouse Logitech MX Master 3",
        "Mouse inalámbrico en excelente estado. Batería dura mucho. Incluye cable USB-C.",
        "good", "sale", "600.00",
        "https://images.unsplash.com/photo-1527814050687-3793815479db?w=500",
        "Electrónica", "carlos.rodriguez@iteso.mx",
    ),
    (
        "Teclado Mecánico Redragon K552",
        "Teclado mecánico gaming, switches azules. LED RGB funcional.",
        "good", "sale", "450.00",
        "https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=500",
        "Electrónica", "carlos.rodriguez@iteso.mx",
    ),
    (
        "Audífonos Sony WH-1000XM4",
        "Cancelación activa de ruido. Perfectos para estudiar. Incluye estuche original.",
        "like_new", "sale", "2800.00",
        "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500",
        "Electrónica", "ana.garcia@iteso.mx",
    ),
    (
        "Laptop Lenovo IdeaPad 3 – i5 11va gen",
        "8 GB RAM, 512 GB SSD. Batería dura ~5 horas. Cargador incluido.",
        "good", "sale", "8500.00",
        "https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=500",
        "Electrónica", "sofia.martinez@iteso.mx",
    ),
    (
        "Tablet Samsung Galaxy Tab A8",
        "Con funda y stylus. Ideal para tomar apuntes en clases. Sin rayones.",
        "like_new", "sale", "3200.00",
        "https://images.unsplash.com/photo-1585790050230-5dd28404ccb9?w=500",
        "Electrónica", "miguel.hernandez@iteso.mx",
    ),
    (
        "Monitor LG 24'' Full HD",
        "Monitor de 24 pulgadas, 75 Hz, IPS. Cable HDMI incluido. Funciona perfecto.",
        "good", "sale", "2200.00",
        "https://images.unsplash.com/photo-1527443224154-c4a573d5e078?w=500",
        "Electrónica", "lucia.fernandez@iteso.mx",
    ),

    # -- Calculators --
    (
        "Calculadora Científica Casio fx-991LA Plus",
        "Casi nueva. Ideal para Cálculo, Física y Estadística. Incluye funda.",
        "like_new", "sale", "380.00",
        "https://images.unsplash.com/photo-1611532736597-de2d4265fba3?w=500",
        "Calculadoras", "ana.garcia@iteso.mx",
    ),
    (
        "Calculadora Graficadora TI-84 Plus",
        "Con cargador. Perfecta para Ingeniería. Algunas rayones en la pantalla protegida.",
        "good", "sale", "1200.00",
        "https://images.unsplash.com/photo-1598300042247-d088f8ab3a91?w=500",
        "Calculadoras", "carlos.rodriguez@iteso.mx",
    ),
    (
        "Casio fx-570ES Plus – REGALO",
        "Ya no la necesito. Funciona al 100%, incluye pilas nuevas.",
        "good", "donation", None,
        "https://images.unsplash.com/photo-1611532736571-48ea0ac8f7d9?w=500",
        "Calculadoras", "sofia.martinez@iteso.mx",
    ),

    # -- Notes --
    (
        "Apuntes Química Orgánica I – ITESO",
        "Apuntes completos del semestre, escaneados en PDF. Incluye ejercicios resueltos.",
        "new", "sale", "80.00",
        "https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?w=500",
        "Apuntes", "miguel.hernandez@iteso.mx",
    ),
    (
        "Apuntes Estadística y Probabilidad",
        "Notas organizadas por tema con ejemplos y fórmulas. Formato impreso, espiral.",
        "good", "sale", "60.00",
        "https://images.unsplash.com/photo-1471107340929-a87cd0f5b5f3?w=500",
        "Apuntes", "lucia.fernandez@iteso.mx",
    ),
    (
        "Guía de Estudio Derecho Corporativo",
        "Resumen ejecutivo de todos los temas con casos prácticos ITESO. PDF editable.",
        "new", "swap", None,
        "https://images.unsplash.com/photo-1450101499163-c8848c66ca85?w=500",
        "Apuntes", "ana.garcia@iteso.mx",
    ),

    # -- ITESO Clothing --
    (
        "Sudadera ITESO Gris – Talla M",
        "Original ITESO, usada una temporada. Muy buen estado, sin manchas ni rotos.",
        "good", "sale", "250.00",
        "https://images.unsplash.com/photo-1556821840-3a63f15732ce?w=500",
        "Ropa ITESO", "carlos.rodriguez@iteso.mx",
    ),
    (
        "Playera Polo ITESO Azul – Talla L",
        "Playera oficial del campus, talla L. Lavada y lista para usar.",
        "like_new", "sale", "180.00",
        "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=500",
        "Ropa ITESO", "sofia.martinez@iteso.mx",
    ),
    (
        "Chamarra ITESO Edición Especial",
        "Chamarra de edición limitada del 50 aniversario ITESO. Talla S. Coleccionable.",
        "like_new", "swap", None,
        "https://images.unsplash.com/photo-1591047139829-d91aecb6caea?w=500",
        "Ropa ITESO", "miguel.hernandez@iteso.mx",
    ),

    # -- Sports --
    (
        "Raqueta de Tenis Wilson – Serie Tour",
        "Con funda, grip nuevo. Ideal para canchas del campus.",
        "good", "sale", "700.00",
        "https://images.unsplash.com/photo-1551698618-1dfe5d97d256?w=500",
        "Deportes", "lucia.fernandez@iteso.mx",
    ),
    (
        "Bicicleta de Montaña Raleigh R6",
        "Rodada 26, frenos de disco, 21 velocidades. Lista para usar.",
        "good", "sale", "3500.00",
        "https://images.unsplash.com/photo-1485965120184-e220f721d03e?w=500",
        "Deportes", "ana.garcia@iteso.mx",
    ),

    # -- Furniture --
    (
        "Silla de Escritorio Ergonómica",
        "Ajustable en altura y respaldo lumbar. Perfecta para estudiar largas horas.",
        "good", "sale", "1500.00",
        "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=500",
        "Muebles", "carlos.rodriguez@iteso.mx",
    ),
    (
        "Escritorio de Madera 120 cm",
        "Con cajón y soporte para monitor. Desmontable para transporte.",
        "used", "sale", "900.00",
        "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=500",
        "Muebles", "sofia.martinez@iteso.mx",
    ),
    # -- More Books --
    (
        "Química General – Petrucci 10ma Ed.",
        "Con algunos subrayados a lápiz. Ideal para Química I y II.",
        "good", "sale", "320.00",
        "https://images.unsplash.com/photo-1532012197267-da84d127e765?w=500",
        "Libros", "miguel.hernandez@iteso.mx",
    ),
    (
        "Física Universitaria – Young Freedman Vol. 1",
        "Sin subrayados, bien conservado. Incluye acceso a recursos digitales.",
        "like_new", "sale", "400.00",
        "https://images.unsplash.com/photo-1524995997946-a1c2e315a42f?w=500",
        "Libros", "sofia.martinez@iteso.mx",
    ),
    (
        "Administración – Robbins & Coulter 13va Ed.",
        "Usado dos semestres, en buen estado. Todas las páginas completas.",
        "used", "swap", None,
        "https://images.unsplash.com/photo-1589829085413-56de8ae18c73?w=500",
        "Libros", "lucia.fernandez@iteso.mx",
    ),
    (
        "Contabilidad Financiera – Guajardo",
        "Edición más reciente. Perfecto para Contabilidad I. Sin anotaciones.",
        "new", "sale", "450.00",
        "https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?w=500",
        "Libros", "carlos.rodriguez@iteso.mx",
    ),
    (
        "Diseño de Interiores – Francis Ching",
        "Libro con muchas ilustraciones técnicas. Excelente estado.",
        "good", "donation", None,
        "https://images.unsplash.com/photo-1497633762265-9d179a990aa6?w=500",
        "Libros", "ana.garcia@iteso.mx",
    ),

    # -- More Electronics --
    (
        "iPhone 13 – 128 GB Negro",
        "Con caja original, cargador y funda. Batería al 89%. Sin rayones.",
        "good", "sale", "9500.00",
        "https://images.unsplash.com/photo-1632661674596-df8be070a5c5?w=500",
        "Electrónica", "miguel.hernandez@iteso.mx",
    ),
    (
        "Nintendo Switch OLED – Blanca",
        "Con dos juegos: Mario Kart y Zelda. Dock y controles Joy-Con incluidos.",
        "like_new", "sale", "7200.00",
        "https://images.unsplash.com/photo-1578303512597-81e6cc155b3e?w=500",
        "Electrónica", "sofia.martinez@iteso.mx",
    ),
    (
        "Webcam Logitech C920 HD",
        "1080p, ideal para videollamadas y streaming. Incluye soporte de clip.",
        "like_new", "sale", "950.00",
        "https://images.unsplash.com/photo-1587826080692-f439cd0b70da?w=500",
        "Electrónica", "lucia.fernandez@iteso.mx",
    ),
    (
        "Cargador Inalámbrico Belkin 15W",
        "Compatible con iPhone y Android. Sin cable de alimentación.",
        "good", "sale", "280.00",
        "https://images.unsplash.com/photo-1618434816151-372d5c13131f?w=500",
        "Electrónica", "carlos.rodriguez@iteso.mx",
    ),
    (
        "Hub USB-C 7 en 1 – UGREEN",
        "HDMI 4K, USB 3.0 x3, SD, MicroSD, USB-C PD. Funciona perfecto.",
        "good", "sale", "420.00",
        "https://images.unsplash.com/photo-1625842268584-8f3296236761?w=500",
        "Electrónica", "ana.garcia@iteso.mx",
    ),

    # -- More Calculators --
    (
        "HP 50g Calculadora Graficadora",
        "Con funda y manual. Ideal para Ingeniería. Pilas nuevas.",
        "good", "sale", "900.00",
        "https://images.unsplash.com/photo-1611532736597-de2d4265fba3?w=500",
        "Calculadoras", "miguel.hernandez@iteso.mx",
    ),
    (
        "Casio ClassPad II fx-CP400",
        "Pantalla táctil. Perfecta para álgebra simbólica. Incluye stylus.",
        "like_new", "sale", "1800.00",
        "https://images.unsplash.com/photo-1568952433726-3896e3881c65?w=500",
        "Calculadoras", "lucia.fernandez@iteso.mx",
    ),

    # -- More Notes --
    (
        "Apuntes Cálculo Diferencial – ITESO",
        "Apuntes digitalizados, 80 páginas. Incluye ejercicios de exámenes anteriores.",
        "new", "sale", "70.00",
        "https://images.unsplash.com/photo-1501504905252-473c47e087f8?w=500",
        "Apuntes", "carlos.rodriguez@iteso.mx",
    ),
    (
        "Resumen Ejecutivo Derecho Constitucional",
        "Todos los temas del semestre resumidos en 30 páginas. Digitalizado en PDF.",
        "new", "donation", None,
        "https://images.unsplash.com/photo-1450101499163-c8848c66ca85?w=500",
        "Apuntes", "sofia.martinez@iteso.mx",
    ),
    (
        "Flashcards Anatomía Humana",
        "200 tarjetas impresas con ilustraciones. Perfectas para repasar.",
        "good", "sale", "120.00",
        "https://images.unsplash.com/photo-1434030216411-0b793f4b4173?w=500",
        "Apuntes", "ana.garcia@iteso.mx",
    ),

    # -- More ITESO Clothing --
    (
        "Short Deportivo ITESO – Talla M",
        "Para usar en el Campus o cancha. Lavado y listo.",
        "good", "sale", "120.00",
        "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=500",
        "Ropa ITESO", "miguel.hernandez@iteso.mx",
    ),
    (
        "Hoodie ITESO Verde – Talla L",
        "Edición especial de ingeniería. Poco uso, sin desgaste.",
        "like_new", "sale", "300.00",
        "https://images.unsplash.com/photo-1556821840-3a63f15732ce?w=500",
        "Ropa ITESO", "lucia.fernandez@iteso.mx",
    ),

    # -- More Sports --
    (
        "Patines en Línea Rollerblade Talla 27",
        "Para niño/adolescente. Protecciones incluidas. En buen estado.",
        "good", "sale", "600.00",
        "https://images.unsplash.com/photo-1604671801908-6f0c6a092c05?w=500",
        "Deportes", "carlos.rodriguez@iteso.mx",
    ),
    (
        "Pelota de Fútbol Nike Premier League",
        "Talla 5, modelo oficial. Bien inflada, poca use.",
        "good", "donation", None,
        "https://images.unsplash.com/photo-1575361204480-aadea25e6e68?w=500",
        "Deportes", "sofia.martinez@iteso.mx",
    ),
    (
        "Mancuernas 5 kg par – NIKE",
        "Par de mancuernas de goma. Sin daños, ideales para rutina en casa.",
        "good", "sale", "350.00",
        "https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=500",
        "Deportes", "ana.garcia@iteso.mx",
    ),

    # -- More Furniture --
    (
        "Lámpara de Escritorio LED con USB",
        "Regulable en brillo y temperatura de color. Puerto USB integrado.",
        "new", "sale", "380.00",
        "https://images.unsplash.com/photo-1507473885765-e6ed057f782c?w=500",
        "Muebles", "miguel.hernandez@iteso.mx",
    ),
    (
        "Repisa Flotante IKEA 80 cm",
        "Madera blanca, tornillos incluidos. Sin instalación previa.",
        "new", "sale", "250.00",
        "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=500",
        "Muebles", "lucia.fernandez@iteso.mx",
    ),
    (
        "Organizador de Escritorio Bambú",
        "Con 5 compartimentos. Ideal para mantener el escritorio ordenado.",
        "like_new", "sale", "150.00",
        "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=500",
        "Muebles", "carlos.rodriguez@iteso.mx",
    ),]


class Command(BaseCommand):
    help = "Seed the database with categories, users, and sample products."

    def handle(self, *args, **kwargs):
        self.stdout.write("=== Starting data seed ===\n")

        # ── Categories ────────────────────────────────────────────────────────
        self.stdout.write("Creating categories...")
        cat_map = {}
        for data in CATEGORIES:
            cat, created = Category.objects.get_or_create(
                name=data["name"],
                defaults={"icon": data["icon"]},
            )
            cat_map[cat.name] = cat
            status = "✓ created" if created else "- already existed"
            self.stdout.write(f"  {status}: {cat.name}")

        # ── Users ──────────────────────────────────────────────────────────
        self.stdout.write("\nCreating users...")
        user_map = {}
        for data in USERS:
            user, created = User.objects.get_or_create(
                email=data["email"],
                defaults={"name": data["name"], "phone": data["phone"]},
            )
            user_map[user.email] = user
            status = "✓ created" if created else "- already existed"
            self.stdout.write(f"  {status}: {user.name}")

        # ── Products ─────────────────────────────────────────────────────────
        self.stdout.write("\nCreating products...")
        created_count = 0
        skipped_count = 0
        for (title, desc, condition, tx_type, price, img, cat_name, seller_email) in PRODUCTS:
            category = cat_map.get(cat_name)
            seller = user_map.get(seller_email)
            if not category or not seller:
                self.stdout.write(
                    self.style.WARNING(f"  ⚠ Skipped '{title}': category or seller not found.")
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
                    "status": "available",
                },
            )
            if created:
                created_count += 1
                self.stdout.write(f"  ✓ created: {title}")
            else:
                skipped_count += 1
                self.stdout.write(f"  - already existed: {title}")

        self.stdout.write(
            self.style.SUCCESS(
                f"\n=== Seed completed: {created_count} products created, {skipped_count} already existed. ==="
            )
        )
