from asgiref.sync import sync_to_async
from django.core.cache import cache
from django.db import models
from django.contrib import admin
import uuid


class Conversation(models.Model):
    id                  = models.AutoField(primary_key=True)

    uid                 = models.UUIDField(db_index=True, unique=True, default=uuid.uuid4, editable=False, help_text="A unique identifier for this conversation")
    profile             = models.JSONField(default=dict, help_text="The profile data associated with this conversation", blank=True)
    conversation        = models.JSONField(default=list, help_text="Array of message dicts making up this conversation", blank=True)
    summary             = models.JSONField(default=dict, help_text="Summary of this conversation", blank=True)

    updated_on          = models.DateTimeField(auto_now=True)
    created_on          = models.DateTimeField(auto_now_add=True)

    class Meta:
        app_label = 'iande'

    #Returns a friendly name for the admin interface
    def __str__(self):
        return f"{self.profile.get('name')} -- {self.created_on}"

    @staticmethod
    async def getOrCreateByUid(uid: str):
        def worker( uid ):
            try:
                return Conversation.objects.get( uid=uid )
            except Conversation.DoesNotExist:
                return Conversation.objects.create( uid=uid )

        return await sync_to_async( worker )( uid )

    # Convert my data to json
    def toJson(self):
        return {
            'uid':          str(self.uid),
            'profile':      self.profile,
            'conversation': self.conversation,
            'summary':      self.summary,
        }

    def summerize(self):
        return f"Conversation with profile: {self.profile.get('name', 'N/A')}"
    summerize.short_description = "Profile Name"

    @staticmethod
    def customAdmin():
        #Inline convo log
        class ConvLogInline(admin.TabularInline):
            model = ConvLog
            extra = 0
            readonly_fields = ('created_on',)
            fields = ('type', 'payload', 'created_on')

        class Admin(admin.ModelAdmin):
            list_display = ('summerize', 'created_on')
            fields = ('uid', 'profile', 'conversation', 'summary')
            readonly_fields = ('uid', 'created_on', 'updated_on',)
            inlines = [ConvLogInline]

        return Admin


class ConvLog(models.Model):
    id = models.AutoField(primary_key=True)

    conversation = models.ForeignKey(Conversation, on_delete=models.CASCADE, related_name='logs')
    type = models.CharField(max_length=64)
    payload = models.JSONField(default=dict, blank=True)

    created_on = models.DateTimeField(auto_now_add=True)

    class Meta:
        app_label = 'iande'

    def __str__(self):
        return f"{self.type} -- {self.created_on}"


class BlogCache(models.Model):
    id                  = models.AutoField(primary_key=True)

    uid                 = models.UUIDField(db_index=True, unique=True, default=uuid.uuid4, editable=False, help_text="A unique identifier for this conversation")
    url                 = models.CharField(max_length=256, db_index=True, unique=True, help_text="The tag for the value")
    markdown            = models.TextField(help_text="Markdown of the website cache")
    tags                = models.JSONField(default=list, blank=True, help_text="Tags associated with this cache")

    updated_on          = models.DateTimeField(auto_now=True)
    created_on          = models.DateTimeField(auto_now_add=True)

    class Meta:
        app_label = 'iande'

    #Returns a friendly name for the admin interface
    def __str__(self):
        return self.url

    @staticmethod
    async def getByUrl(url):
        try:
            obj = await sync_to_async( BlogCache.objects.get )( url=url )
            return obj
        except BlogCache.DoesNotExist:
            return None

    # Convert my data to json
    def toJson(self):
        return {
            'uid':      str(self.uid),
            'url':      str(self.url),
            'markdown': str(self.markdown),
            'tags':     self.tags,
        }

    def tag_list(self):
        return ", ".join(self.tags)
    tag_list.short_description = "Tags"

    @staticmethod
    def customAdmin():
        class Admin(admin.ModelAdmin):
            list_display = ('url', 'tag_list', 'created_on')
            search_fields = ('url', )
            fields = ('uid', 'url', 'markdown', 'tags')
            readonly_fields = ('uid', 'created_on', 'updated_on',)

            class Media:
                css = {
                    'all': ('admin_custom.css',)
                }

            def save_model(self, request, obj, form, change):
                cache.clear()
                super(Admin, self).save_model(request, obj, form, change)

        return Admin
