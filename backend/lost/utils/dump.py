import types

def dump(obj, header):
    print(header)
    for attr in dir(obj):
        if hasattr(obj, attr):
            if not attr.startswith('_'):
                if not isinstance(getattr(obj, attr), types.BuiltinMethodType):
                    print("obj.%s = %s" % (attr, getattr(obj, attr)))
