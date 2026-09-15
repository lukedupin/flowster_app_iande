from asgiref.sync import sync_to_async
from django.core.cache import cache
from django.db import models
from django.contrib import admin
import uuid


class Conversation(models.Model):
    id                  = models.AutoField(primary_key=True)

    uid                 = models.UUIDField(db_index=True, unique=True, default=uuid.uuid4, editable=False, help_text="A unique identifier for this conversation")
    url                 = models.CharField(max_length=256, db_index=True, blank=True, default='', help_text="The URL this conversation is running through")
    profile             = models.JSONField(default=dict, help_text="The profile data associated with this conversation", blank=True)
    conversation        = models.JSONField(default=list, help_text="Array of message dicts making up this conversation", blank=True)
    summary             = models.TextField(default='', help_text="Markdown summary of this conversation", blank=True)
    scripts             = models.JSONField(default=dict, help_text="Dict of script name to the number of responses from that script", blank=True)
    conversation_count  = models.IntegerField(default=0, help_text="A count associated with this conversation")

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
            'url':          str(self.url),
            'profile':      self.profile,
            'conversation': self.conversation,
            'summary':      self.summary,
            'scripts':      self.scripts,
            'created_on':   self.created_on.isoformat(),
        }

    def summerize(self):
        return f"Conversation with profile: {self.profile.get('name', 'N/A')}"
    summerize.short_description = "Profile Name"

    @staticmethod
    def customAdmin():
        class Admin(admin.ModelAdmin):
            list_display = ('summerize', 'created_on')
            fields = ('uid', 'profile', 'conversation', 'summary')
            readonly_fields = ('uid', 'created_on', 'updated_on',)

        return Admin


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


class VoiceClone(models.Model):
    id                  = models.AutoField(primary_key=True)

    uid                 = models.UUIDField(db_index=True, unique=True, default=uuid.uuid4, editable=False, help_text="A unique identifier for this voice clone")

    name                = models.CharField(max_length=128, help_text="Display name for this voice")
    voice_model         = models.CharField(unique=True, max_length=64, help_text="Snake case model name")
    file                = models.FileField(upload_to='iande/voices', help_text="Reference audio clip used for voice cloning")
    exaggeration        = models.FloatField(default=2.4, help_text="Chatterbox exaggeration parameter")
    cfg_weight          = models.FloatField(default=1.5, help_text="Chatterbox cfg weight parameter")

    updated_on          = models.DateTimeField(auto_now=True)
    created_on          = models.DateTimeField(auto_now_add=True)

    class Meta:
        app_label = 'iande'

    #Returns a friendly name for the admin interface
    def __str__(self):
        return self.name

    # Convert my data to json
    def toJson(self):
        return {
            'uid':          str(self.uid),
            'name':         self.name,
            'voice_model':  self.voice_model,
            #'file':         self.file.url if self.file else None,
            'exaggeration': self.exaggeration,
            'cfg_weight':   self.cfg_weight,
        }

    @staticmethod
    def customAdmin():
        class Admin(admin.ModelAdmin):
            list_display = ('name', 'exaggeration', 'cfg_weight', 'created_on')
            fields = ('uid', 'name', 'voice_model', 'file', 'exaggeration', 'cfg_weight')
            readonly_fields = ('uid', 'created_on', 'updated_on',)

        return Admin


class Context(models.Model):
    id                  = models.AutoField(primary_key=True)

    uid                 = models.UUIDField(db_index=True, unique=True, default=uuid.uuid4, editable=False, help_text="A unique identifier for this context")
    title               = models.CharField(max_length=255, help_text="Display title for this context")
    key                 = models.SlugField(max_length=128, db_index=True, unique=True, help_text="Unique machine-readable key for this context")
    content             = models.TextField(blank=True, default='', help_text="Markdown content of this context")

    updated_on          = models.DateTimeField(auto_now=True)
    created_on          = models.DateTimeField(auto_now_add=True)

    class Meta:
        app_label = 'iande'

    #Returns a friendly name for the admin interface
    def __str__(self):
        return self.title

    @staticmethod
    async def getByKey(key):
        try:
            return await sync_to_async( Context.objects.get )( key=key )
        except Context.DoesNotExist:
            return None

    # Convert my data to json
    def toJson(self, chat_js=False):
        base = {
            'title':   self.title,
            'key':     self.key,
            'content': self.content,
        }

        js = {
            'id':  self.id,
            'uid': str(self.uid),
        }

        return base if chat_js else {**base, **js}

    @classmethod
    def toStructure(cls):
        instance = cls()
        js = instance.toJson(chat_js=True)
        return {
            name: cls._meta.get_field(name).help_text
            for name in js.keys()
        }

    @staticmethod
    def customAdmin():
        class Admin(admin.ModelAdmin):
            list_display = ('title', 'key', 'created_on')
            search_fields = ('title', 'key')
            fields = ('uid', 'title', 'key', 'content')
            readonly_fields = ('uid', 'created_on', 'updated_on',)

        return Admin
