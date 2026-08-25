from iande.models import *

def register_models( admin_site ):
    for klass in (Conversation, BlogCache):
        admin_site.register( klass, klass.customAdmin())
