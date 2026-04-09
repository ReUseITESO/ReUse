"""
Management command para poblar la base de datos con datos de prueba realistas.
Crea usuarios, categorías, productos con imágenes, badges y transacciones.

Uso: python manage.py seed_dev_data
"""

import random
from datetime import timedelta

from django.core.management.base import BaseCommand
from django.utils import timezone

from core.models import User
from gamification.models.badges import Badges
from gamification.models.environment_impact import EnvironmentImpact
from gamification.models.point_rule import PointRule
from gamification.models.user_badges import UserBadges
from marketplace.models import Category, Images, Products, Transaction


class Command(BaseCommand):
    help = "Pobla la BD con datos de prueba para desarrollo"

    def handle(self, *args, **options):
        self.stdout.write("Iniciando seed de datos de desarrollo...\n")

        users = self._create_users()
        categories = self._create_categories()
        products = self._create_products(users, categories)
        self._create_images(products)
        badges = self._create_badges()
        self._assign_badges(users, badges)
        self._create_environment_impact(users)
        self._create_point_rules()
        self._create_transactions(users, products)

        self.stdout.write(self.style.SUCCESS("\nSeed completado exitosamente!"))
        self.stdout.write(f"   {User.objects.count()} usuarios")
        self.stdout.write(f"   {Category.objects.count()} categorias")
        self.stdout.write(f"   {Products.objects.count()} productos")
        self.stdout.write(f"   {Images.objects.count()} imagenes")
        self.stdout.write(f"   {Badges.objects.count()} badges")
        self.stdout.write(f"   {Transaction.objects.count()} transacciones")

    def _create_users(self):
        self.stdout.write("  Creando usuarios...")
        users_data = [
            {
                "email": "jose.chavez@iteso.mx",
                "first_name": "Jose",
                "last_name": "Chavez",
                "phone": "3300001111",
                "points": 350,
                "profile_picture": "https://i.pravatar.cc/150?img=3",
            },
            {
                "email": "maria.garcia@iteso.mx",
                "first_name": "María",
                "last_name": "García Pérez",
                "phone": "3398765432",
                "points": 250,
                "profile_picture": "https://i.pravatar.cc/150?img=5",
            },
            {
                "email": "carlos.lopez@iteso.mx",
                "first_name": "Carlos",
                "last_name": "López Hernández",
                "phone": "3312340001",
                "points": 180,
                "profile_picture": "https://i.pravatar.cc/150?img=12",
            },
            {
                "email": "ana.martinez@iteso.mx",
                "first_name": "Ana",
                "last_name": "Martínez Ruiz",
                "phone": "3312340002",
                "points": 420,
                "profile_picture": "https://i.pravatar.cc/150?img=9",
            },
            {
                "email": "diego.ramirez@iteso.mx",
                "first_name": "Diego",
                "last_name": "Ramírez Soto",
                "phone": "3312340003",
                "points": 90,
                "profile_picture": "https://i.pravatar.cc/150?img=15",
            },
            {
                "email": "sofia.torres@iteso.mx",
                "first_name": "Sofía",
                "last_name": "Torres Mendoza",
                "phone": "3312340004",
                "points": 310,
                "profile_picture": "https://i.pravatar.cc/150?img=25",
            },
            {
                "email": "pedro.sanchez@iteso.mx",
                "first_name": "Pedro",
                "last_name": "Sánchez Díaz",
                "phone": "3312340005",
                "points": 150,
                "profile_picture": "https://i.pravatar.cc/150?img=33",
            },
            {
                "email": "laura.hernandez@iteso.mx",
                "first_name": "Laura",
                "last_name": "Hernández Vega",
                "phone": "3312340006",
                "points": 75,
                "profile_picture": "https://i.pravatar.cc/150?img=44",
            },
        ]

        created = []
        for data in users_data:
            email = data.pop("email")
            user, was_created = User.objects.get_or_create(
                email=email,
                defaults=data,
            )
            if was_created:
                user.set_password("ReUse2026!")
                user.is_active = True
                user.is_email_verified = True
                user.save()
            else:
                # Actualizar puntos y perfil si ya existe
                for k, v in data.items():
                    setattr(user, k, v)
                user.is_active = True
                user.is_email_verified = True
                user.save()
            created.append(user)

        self.stdout.write(f"    {len(created)} usuarios listos")
        return created

    def _create_categories(self):
        self.stdout.write("  Creando categorias...")
        categories_data = [
            {"name": "Libros y Apuntes", "icon": "book"},
            {"name": "Electrónica", "icon": "laptop"},
            {"name": "Ropa y Accesorios", "icon": "shirt"},
            {"name": "Muebles", "icon": "armchair"},
            {"name": "Deportes", "icon": "dumbbell"},
            {"name": "Transporte", "icon": "bike"},
            {"name": "Instrumentos Musicales", "icon": "music"},
            {"name": "Arte y Papelería", "icon": "palette"},
            {"name": "Cocina y Hogar", "icon": "utensils"},
            {"name": "Videojuegos", "icon": "gamepad-2"},
        ]

        created = []
        for data in categories_data:
            cat, _ = Category.objects.get_or_create(
                name=data["name"],
                defaults={"icon": data["icon"]},
            )
            created.append(cat)

        self.stdout.write(f"    {len(created)} categorias listas")
        return created

    def _create_products(self, users, categories):
        self.stdout.write("  Creando productos...")

        # Mapear categorías por nombre para fácil acceso
        cat = {c.name: c for c in categories}

        products_data = [
            # Libros
            {
                "seller": users[1],  # María
                "category": cat["Libros y Apuntes"],
                "title": "Cálculo de Stewart 8va edición",
                "description": "Libro de Cálculo, muy buen estado. Solo tiene algunos subrayados con lápiz. Ideal para las materias de Cálculo I y II.",
                "condition": "buen_estado",
                "transaction_type": "sale",
                "price": "350.00",
                "image_url": "https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=400",
            },
            {
                "seller": users[2],  # Carlos
                "category": cat["Libros y Apuntes"],
                "title": "Marketing de Kotler 16ta edición",
                "description": "Libro seminuevo, sin anotaciones. Lo usé solo un semestre para la materia de Mercadotecnia.",
                "condition": "como_nuevo",
                "transaction_type": "swap",
                "price": None,
                "image_url": "https://images.unsplash.com/photo-1512820790803-83ca734da794?w=400",
            },
            {
                "seller": users[3],  # Ana
                "category": cat["Libros y Apuntes"],
                "title": "Apuntes completos de Termodinámica",
                "description": "Apuntes de todo el semestre con problemas resueltos. Están en PDF, te los paso por correo.",
                "condition": "buen_estado",
                "transaction_type": "donation",
                "price": None,
                "image_url": "https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?w=400",
            },
            {
                "seller": users[5],  # Sofía
                "category": cat["Libros y Apuntes"],
                "title": "Física Universitaria - Sears Zemansky",
                "description": "Edición 14, pasta dura. Tiene el CD complementario. Perfecto para Física I y II.",
                "condition": "nuevo",
                "transaction_type": "sale",
                "price": "450.00",
                "image_url": "https://images.unsplash.com/photo-1589998059171-988d887df646?w=400",
            },
            # Electronica
            {
                "seller": users[0],  # Jose
                "category": cat["Electrónica"],
                "title": "Mouse Logitech MX Master 3",
                "description": "Mouse ergonómico inalámbrico. Funciona perfecto, lo vendo porque me regalaron otro. Incluye cable de carga USB-C.",
                "condition": "buen_estado",
                "transaction_type": "sale",
                "price": "850.00",
                "image_url": "https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?w=400",
            },
            {
                "seller": users[4],  # Diego
                "category": cat["Electrónica"],
                "title": "Teclado mecánico Redragon Kumara",
                "description": "Teclado mecánico RGB, switches blue. Muy bueno para programar. Lo usé un año.",
                "condition": "buen_estado",
                "transaction_type": "sale",
                "price": "600.00",
                "image_url": "https://images.unsplash.com/photo-1595225476474-87563907a212?w=400",
            },
            {
                "seller": users[1],  # María
                "category": cat["Electrónica"],
                "title": "Audífonos Sony WH-1000XM4",
                "description": "Audífonos con cancelación de ruido. Batería dura más de 20 horas. Incluye estuche original y cable auxiliar.",
                "condition": "como_nuevo",
                "transaction_type": "sale",
                "price": "2800.00",
                "image_url": "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400",
            },
            {
                "seller": users[6],  # Pedro
                "category": cat["Electrónica"],
                "title": "Cargador MacBook Pro 61W USB-C",
                "description": "Cargador original Apple, funciona perfecto. Lo vendo porque cambié de laptop.",
                "condition": "usado",
                "transaction_type": "sale",
                "price": "500.00",
                "image_url": "https://images.unsplash.com/photo-1589739900243-4b52cd9dd8c5?w=400",
            },
            {
                "seller": users[3],  # Ana
                "category": cat["Electrónica"],
                "title": "Calculadora Texas Instruments TI-84",
                "description": "Calculadora gráfica en perfecto estado. Necesaria para varias materias de ingeniería.",
                "condition": "buen_estado",
                "transaction_type": "sale",
                "price": "1200.00",
                "image_url": "https://images.unsplash.com/photo-1564466809058-bf4114d55352?w=400",
            },
            # Ropa y Accesorios
            {
                "seller": users[5],  # Sofía
                "category": cat["Ropa y Accesorios"],
                "title": "Sudadera oficial ITESO gris",
                "description": "Sudadera con capucha del ITESO, talla M. La lavé pocas veces, está prácticamente nueva.",
                "condition": "como_nuevo",
                "transaction_type": "sale",
                "price": "350.00",
                "image_url": "https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=400",
            },
            {
                "seller": users[7],  # Laura
                "category": cat["Ropa y Accesorios"],
                "title": "Playera polo ITESO azul marino",
                "description": "Playera polo del uniforme, talla L. La doy porque ya no me queda.",
                "condition": "buen_estado",
                "transaction_type": "donation",
                "price": None,
                "image_url": "https://images.unsplash.com/photo-1581655353564-df123a1eb820?w=400",
            },
            {
                "seller": users[2],  # Carlos
                "category": cat["Ropa y Accesorios"],
                "title": "Mochila Herschel negra",
                "description": "Mochila negra con compartimento para laptop de 15 pulgadas. Muy resistente y en buen estado.",
                "condition": "buen_estado",
                "transaction_type": "sale",
                "price": "600.00",
                "image_url": "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=400",
            },
            # Muebles
            {
                "seller": users[0],  # Jose
                "category": cat["Muebles"],
                "title": "Escritorio plegable IKEA",
                "description": "Escritorio plegable ideal para depa de estudiante. Mide 100x60cm. Se dobla para guardar fácil.",
                "condition": "buen_estado",
                "transaction_type": "sale",
                "price": "800.00",
                "image_url": "https://images.unsplash.com/photo-1518455027359-f3f8164ba6bd?w=400",
            },
            {
                "seller": users[3],  # Ana
                "category": cat["Muebles"],
                "title": "Silla gamer económica",
                "description": "Silla gamer negra con rojo, reclinable. La usé 2 años, todavía está cómoda. Solo tiene un pequeño rayón en el descansabrazos.",
                "condition": "usado",
                "transaction_type": "sale",
                "price": "1500.00",
                "image_url": "https://images.unsplash.com/photo-1592078615290-033ee584e267?w=400",
            },
            {
                "seller": users[6],  # Pedro
                "category": cat["Muebles"],
                "title": "Librero de madera 4 niveles",
                "description": "Librero de pino, 4 repisas. Perfecto para organizar libros y decoración. Lo desarmo para que te lo puedas llevar.",
                "condition": "buen_estado",
                "transaction_type": "swap",
                "price": None,
                "image_url": "https://images.unsplash.com/photo-1594620302200-9a762244a156?w=400",
            },
            # Deportes
            {
                "seller": users[4],  # Diego
                "category": cat["Deportes"],
                "title": "Raqueta de tenis Wilson",
                "description": "Raqueta Wilson Blade v8, usada una temporada. Viene con funda. Ideal para alguien que quiere empezar a jugar en serio.",
                "condition": "buen_estado",
                "transaction_type": "sale",
                "price": "900.00",
                "image_url": "https://images.unsplash.com/photo-1622279457486-62dcc4a431d6?w=400",
            },
            {
                "seller": users[7],  # Laura
                "category": cat["Deportes"],
                "title": "Balón de fútbol Adidas Tango",
                "description": "Balón oficial, tamaño 5. Casi nuevo, lo usé en unas cascaritas nada más.",
                "condition": "como_nuevo",
                "transaction_type": "donation",
                "price": None,
                "image_url": "https://images.unsplash.com/photo-1575361204480-aadea25e6e68?w=400",
            },
            {
                "seller": users[5],  # Sofía
                "category": cat["Deportes"],
                "title": "Mat de yoga con correa",
                "description": "Tapete de yoga de 6mm, color morado. Incluye correa para cargarlo. Antiderrapante.",
                "condition": "nuevo",
                "transaction_type": "sale",
                "price": "280.00",
                "image_url": "https://images.unsplash.com/photo-1601925260368-ae2f83cf8b7f?w=400",
            },
            # Transporte
            {
                "seller": users[2],  # Carlos
                "category": cat["Transporte"],
                "title": "Bicicleta de montaña R26",
                "description": "Bici de montaña con 21 velocidades. Frenos de disco. Ideal para ir al ITESO desde Tlaquepaque.",
                "condition": "usado",
                "transaction_type": "sale",
                "price": "2500.00",
                "image_url": "https://images.unsplash.com/photo-1485965120184-e220f721d03e?w=400",
            },
            {
                "seller": users[0],  # Jose
                "category": cat["Transporte"],
                "title": "Patineta eléctrica Xiaomi",
                "description": "Scooter eléctrico Xiaomi Mi Pro 2. Autonomía de 40km. La usé un semestre para ir al campus.",
                "condition": "buen_estado",
                "transaction_type": "sale",
                "price": "5500.00",
                "image_url": "https://images.unsplash.com/photo-1558618666-fcd25c85f82e?w=400",
            },
            # Instrumentos Musicales
            {
                "seller": users[6],  # Pedro
                "category": cat["Instrumentos Musicales"],
                "title": "Guitarra acústica Yamaha F310",
                "description": "Guitarra acústica para principiantes. Viene con funda y capo. Excelente sonido para el precio.",
                "condition": "buen_estado",
                "transaction_type": "sale",
                "price": "1800.00",
                "image_url": "https://images.unsplash.com/photo-1510915361894-db8b60106cb1?w=400",
            },
            {
                "seller": users[1],  # María
                "category": cat["Instrumentos Musicales"],
                "title": "Ukulele soprano Kala",
                "description": "Ukulele soprano en color natural. Perfecto para aprender. Lo regalo porque me compré uno tenor.",
                "condition": "buen_estado",
                "transaction_type": "donation",
                "price": None,
                "image_url": "https://images.unsplash.com/photo-1564186763535-ebb21ef5277f?w=400",
            },
            # Arte y Papeleria
            {
                "seller": users[3],  # Ana
                "category": cat["Arte y Papelería"],
                "title": "Set de marcadores Copic (24 pcs)",
                "description": "Marcadores Copic Sketch, set de 24 colores básicos. Ideales para Diseño y Arquitectura.",
                "condition": "como_nuevo",
                "transaction_type": "sale",
                "price": "1600.00",
                "image_url": "https://images.unsplash.com/photo-1513364776144-60967b0f800f?w=400",
            },
            {
                "seller": users[7],  # Laura
                "category": cat["Arte y Papelería"],
                "title": "Tableta gráfica Wacom Intuos S",
                "description": "Tableta de dibujo digital, funciona con Mac y Windows. Incluye pluma y cable USB.",
                "condition": "buen_estado",
                "transaction_type": "sale",
                "price": "1200.00",
                "image_url": "https://images.unsplash.com/photo-1572120360610-d971b9d7767c?w=400",
            },
            # Cocina y Hogar
            {
                "seller": users[5],  # Sofía
                "category": cat["Cocina y Hogar"],
                "title": "Cafetera Nespresso Vertuo",
                "description": "Cafetera de cápsulas, prácticamente nueva. Incluye 10 cápsulas de regalo. Perfecta para desvelos de parciales.",
                "condition": "como_nuevo",
                "transaction_type": "sale",
                "price": "1800.00",
                "image_url": "https://images.unsplash.com/photo-1517701604599-bb29b565090c?w=400",
            },
            {
                "seller": users[4],  # Diego
                "category": cat["Cocina y Hogar"],
                "title": "Set de tuppers herméticos (10 pcs)",
                "description": "Contenedores herméticos de vidrio con tapa. Varios tamaños. Ideales para meal prep.",
                "condition": "nuevo",
                "transaction_type": "sale",
                "price": "380.00",
                "image_url": "https://images.unsplash.com/photo-1584568694244-14fbdf83bd30?w=400",
            },
            # Videojuegos
            {
                "seller": users[4],  # Diego
                "category": cat["Videojuegos"],
                "title": "Control Xbox Series X/S negro",
                "description": "Control inalámbrico Xbox, compatible con PC. Lo uso para Steam. Funciona de 10.",
                "condition": "buen_estado",
                "transaction_type": "sale",
                "price": "750.00",
                "image_url": "https://images.unsplash.com/photo-1612287230202-1ff1d85d1bdf?w=400",
            },
            {
                "seller": users[0],  # Jose
                "category": cat["Videojuegos"],
                "title": "The Legend of Zelda: TOTK (Switch)",
                "description": "Juego físico para Nintendo Switch. Lo terminé y lo quiero cambiar por otro juego.",
                "condition": "como_nuevo",
                "transaction_type": "swap",
                "price": None,
                "image_url": "https://images.unsplash.com/photo-1612036782180-6f0b6cd846fe?w=400",
            },
            {
                "seller": users[7],  # Laura
                "category": cat["Videojuegos"],
                "title": "Nintendo Switch Lite turquesa",
                "description": "Switch Lite en excelente estado. Viene con cargador y estuche rígido. Tiene protector de pantalla.",
                "condition": "buen_estado",
                "transaction_type": "sale",
                "price": "3200.00",
                "image_url": "https://images.unsplash.com/photo-1578303512597-81e6cc155b3e?w=400",
            },
        ]

        created = []
        for data in products_data:
            product, was_created = Products.objects.get_or_create(
                title=data["title"],
                seller=data["seller"],
                defaults={
                    "category": data["category"],
                    "description": data["description"],
                    "condition": data["condition"],
                    "transaction_type": data["transaction_type"],
                    "price": data["price"],
                    "image_url": data.get("image_url", ""),
                },
            )
            created.append(product)

        self.stdout.write(f"    {len(created)} productos listos")
        return created

    def _create_images(self, products):
        self.stdout.write("  Creando imagenes de productos...")
        count = 0

        extra_images = {
            "Cálculo de Stewart 8va edición": [
                "https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=400",
                "https://images.unsplash.com/photo-1497633762265-9d179a990aa6?w=400",
            ],
            "Mouse Logitech MX Master 3": [
                "https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?w=400",
                "https://images.unsplash.com/photo-1615663245857-ac93bb7c39e7?w=400",
                "https://images.unsplash.com/photo-1586349906319-47f1f6643a8b?w=400",
            ],
            "Audífonos Sony WH-1000XM4": [
                "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400",
                "https://images.unsplash.com/photo-1583394838336-acd977736f90?w=400",
            ],
            "Guitarra acústica Yamaha F310": [
                "https://images.unsplash.com/photo-1510915361894-db8b60106cb1?w=400",
                "https://images.unsplash.com/photo-1525201548942-d8732f6617a0?w=400",
                "https://images.unsplash.com/photo-1550985616-10810253b84d?w=400",
            ],
            "Bicicleta de montaña R26": [
                "https://images.unsplash.com/photo-1485965120184-e220f721d03e?w=400",
                "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400",
            ],
            "Silla gamer económica": [
                "https://images.unsplash.com/photo-1592078615290-033ee584e267?w=400",
                "https://images.unsplash.com/photo-1598550476439-6847785fcea6?w=400",
            ],
            "Nintendo Switch Lite turquesa": [
                "https://images.unsplash.com/photo-1578303512597-81e6cc155b3e?w=400",
                "https://images.unsplash.com/photo-1606144042614-b2417e99c4e3?w=400",
            ],
        }

        for product in products:
            urls = extra_images.get(
                product.title, [product.image_url] if product.image_url else []
            )
            for i, url in enumerate(urls):
                _, created = Images.objects.get_or_create(
                    product=product,
                    order_number=i + 1,
                    defaults={"image_url": url},
                )
                if created:
                    count += 1

        self.stdout.write(f"    {count} imagenes creadas")

    def _create_badges(self):
        self.stdout.write("  Creando badges...")
        badges_data = [
            {
                "name": "Primera Venta",
                "description": "Completaste tu primera venta en ReUse",
                "icon": "tag",
                "points": 50,
                "rarity": "comun",
            },
            {
                "name": "Comprador Estrella",
                "description": "Realizaste 5 compras exitosas",
                "icon": "star",
                "points": 100,
                "rarity": "raro",
            },
            {
                "name": "Eco Warrior",
                "description": "Donaste 3 o mas productos a la comunidad ITESO",
                "icon": "leaf",
                "points": 150,
                "rarity": "epico",
            },
            {
                "name": "Trueque Master",
                "description": "Completaste 3 intercambios exitosos",
                "icon": "refresh",
                "points": 120,
                "rarity": "raro",
            },
            {
                "name": "Bienvenido a ReUse",
                "description": "Te registraste en la plataforma.",
                "icon": "wave",
                "points": 10,
                "rarity": "comun",
            },
            {
                "name": "Vendedor Top",
                "description": "Vendiste mas de 10 productos",
                "icon": "trophy",
                "points": 200,
                "rarity": "legendario",
            },
            {
                "name": "Librofilo",
                "description": "Publicaste 5 libros en la plataforma",
                "icon": "books",
                "points": 80,
                "rarity": "raro",
            },
            {
                "name": "Perfil Completo",
                "description": "Llenaste todos los campos de tu perfil",
                "icon": "check",
                "points": 30,
                "rarity": "comun",
            },
        ]

        created = []
        for data in badges_data:
            badge, _ = Badges.objects.get_or_create(
                name=data["name"],
                defaults=data,
            )
            created.append(badge)

        self.stdout.write(f"    {len(created)} badges listos")
        return created

    def _assign_badges(self, users, badges):
        self.stdout.write("  Asignando badges a usuarios...")
        badge_map = {b.name: b for b in badges}
        count = 0

        assignments = [
            # Todos tienen el badge de bienvenida
            *[(u, badge_map["Bienvenido a ReUse"]) for u in users],
            # Algunos tienen badges extra
            (users[0], badge_map["Primera Venta"]),
            (users[0], badge_map["Perfil Completo"]),
            (users[1], badge_map["Primera Venta"]),
            (users[1], badge_map["Eco Warrior"]),
            (users[2], badge_map["Comprador Estrella"]),
            (users[3], badge_map["Primera Venta"]),
            (users[3], badge_map["Vendedor Top"]),
            (users[3], badge_map["Perfil Completo"]),
            (users[4], badge_map["Trueque Master"]),
            (users[5], badge_map["Primera Venta"]),
            (users[5], badge_map["Librofilo"]),
            (users[6], badge_map["Primera Venta"]),
            (users[7], badge_map["Comprador Estrella"]),
        ]

        for user, badge in assignments:
            _, created = UserBadges.objects.get_or_create(user=user, badges=badge)
            if created:
                count += 1

        self.stdout.write(f"    {count} badges asignados")

    def _create_environment_impact(self, users):
        self.stdout.write("  Creando impacto ambiental...")
        count = 0
        for user in users:
            _, created = EnvironmentImpact.objects.get_or_create(
                user=user,
                defaults={
                    "kg_co2_saved": round(random.uniform(0.5, 25.0), 2),
                    "reused_products": random.randint(0, 12),
                },
            )
            if created:
                count += 1

        self.stdout.write(f"    {count} registros de impacto")

    def _create_point_rules(self):
        self.stdout.write("  Creando reglas de puntos...")
        rules_data = [
            {"action": "publish_item", "points": 10},
            {"action": "complete_donation", "points": 25},
            {"action": "complete_sale", "points": 15},
            {"action": "complete_exchange", "points": 20},
            {"action": "receive_positive_review", "points": 10},
        ]
        count = 0
        for data in rules_data:
            _, created = PointRule.objects.get_or_create(
                action=data["action"],
                defaults={"points": data["points"], "is_active": True},
            )
            if created:
                count += 1

        self.stdout.write(f"    {count} reglas de puntos creadas")

    def _create_transactions(self, users, products):
        self.stdout.write("  Creando transacciones...")
        now = timezone.now()
        count = 0

        # Crear algunas transacciones realistas
        transactions_data = [
            {
                "product_title": "Cálculo de Stewart 8va edición",
                "buyer": users[4],  # Diego compra el libro
                "status": "completada",
                "delivery_location": "Cafetería ITESO",
                "seller_confirmation": True,
                "buyer_confirmation": True,
                "days_ago": 15,
            },
            {
                "product_title": "Teclado mecánico Redragon Kumara",
                "buyer": users[0],  # Jose compra el teclado
                "status": "completada",
                "delivery_location": "Biblioteca ITESO",
                "seller_confirmation": True,
                "buyer_confirmation": True,
                "days_ago": 8,
            },
            {
                "product_title": "Sudadera oficial ITESO gris",
                "buyer": users[2],  # Carlos compra la sudadera
                "status": "confirmada",
                "delivery_location": "Entrada principal ITESO",
                "seller_confirmation": True,
                "buyer_confirmation": False,
                "days_ago": 2,
            },
            {
                "product_title": "Balón de fútbol Adidas Tango",
                "buyer": users[6],  # Pedro recibe la donación
                "status": "completada",
                "delivery_location": "Canchas ITESO",
                "seller_confirmation": True,
                "buyer_confirmation": True,
                "days_ago": 20,
            },
            {
                "product_title": "Control Xbox Series X/S negro",
                "buyer": users[3],  # Ana compra el control
                "status": "pendiente",
                "delivery_location": "Estacionamiento ITESO",
                "seller_confirmation": False,
                "buyer_confirmation": False,
                "days_ago": 1,
            },
        ]

        product_map = {p.title: p for p in products}

        for t_data in transactions_data:
            product = product_map.get(t_data["product_title"])
            if not product:
                continue

            _, created = Transaction.objects.get_or_create(
                product=product,
                defaults={
                    "seller": product.seller,
                    "buyer": t_data["buyer"],
                    "transaction_type": product.transaction_type,
                    "status": t_data["status"],
                    "delivery_location": t_data["delivery_location"],
                    "seller_confirmation": t_data["seller_confirmation"],
                    "buyer_confirmation": t_data["buyer_confirmation"],
                    "seller_confirmed_at": now - timedelta(days=t_data["days_ago"])
                    if t_data["seller_confirmation"]
                    else None,
                    "buyer_confirmed_at": now - timedelta(days=t_data["days_ago"])
                    if t_data["buyer_confirmation"]
                    else None,
                },
            )
            if created:
                # Actualizar status del producto según la transacción
                if t_data["status"] == "completada":
                    product.status = "completado"
                elif t_data["status"] in ("confirmada", "pendiente"):
                    product.status = "en_proceso"
                product.save(update_fields=["status"])
                count += 1

        self.stdout.write(f"    {count} transacciones creadas")
