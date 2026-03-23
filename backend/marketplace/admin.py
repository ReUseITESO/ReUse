from django.contrib import admin

from marketplace.models import Category, Products
from marketplace.models.product_reaction import ProductReaction
from marketplace.models.report import Report

# Scaffolding: admin registrations for existing marketplace models.
# Uncomment the others after running makemigrations for Images, Transaction, ForumQuestion.


@admin.register(Category)
class CategoryAdmin(admin.ModelAdmin):
    list_display = ["id", "name", "created_at"]


@admin.register(Products)
class ProductsAdmin(admin.ModelAdmin):
    list_display = ["id", "title", "seller", "category", "status", "price"]
    list_filter = ["status", "transaction_type"]


@admin.register(ProductReaction)
class ProductReactionAdmin(admin.ModelAdmin):
    list_display = ["id", "product", "user", "type", "created_at"]
    list_filter = ["type"]
    search_fields = ["user__email", "product__title"]
    ordering = ["-created_at"]


@admin.register(Report)
class ReportAdmin(admin.ModelAdmin):
    list_display = ["id", "product", "reporter", "reason", "created_at"]
    list_filter = ["reason"]
    search_fields = ["reporter__email", "product__title"]
    ordering = ["-created_at"]


# TODO: uncomment after makemigrations for Images
# from marketplace.models.images import Images
#
# @admin.register(Images)
# class ImagesAdmin(admin.ModelAdmin):
#     list_display = ["id", "products", "order_number"]


# TODO: uncomment after makemigrations for Transaction
# from marketplace.models.transaction import Transaction
#
# @admin.register(Transaction)
# class TransactionAdmin(admin.ModelAdmin):
#     list_display = ["id", "products", "seller", "buyer", "status"]


# TODO: uncomment after makemigrations for ForumQuestion
# from marketplace.models.forum_question import ForumQuestion
#
# @admin.register(ForumQuestion)
# class ForumQuestionAdmin(admin.ModelAdmin):
#     list_display = ["id", "products", "user", "created_at","post"]
