from hashlib import md5

def encode(string: str):
    m = md5()
    m.update(string.encode("utf-8"))
    return str(int(m.hexdigest(), 16))[0:12]

def match(hash: str, string: str):
    return encode(string) == hash