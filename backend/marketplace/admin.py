from django.contrib import admin

from marketplace.models import Category, Products

# Scaffolding: admin registrations for existing marketplace models.
# Uncomment the others after running makemigrations for Images, Transaction, ForumQuestion.


@admin.register(Category)
class CategoryAdmin(admin.ModelAdmin):
    list_display = ["id", "name", "created_at"]


@admin.register(Products)
class ProductsAdmin(admin.ModelAdmin):
    list_display = ["id", "title", "seller", "category", "status", "price"]
    list_filter = ["status", "transaction_type"]


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
