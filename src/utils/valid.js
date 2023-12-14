export function validateLogin(name, password) {
    name = name.trim()
    password = password.trim()
    if (name.length < 0 || !name) {
        return false;
    }
    if (password.length < 0 || !password) {
        return false
    }
    return true;
}

export function validateNamePrice(name, price) {
    name = name.trim();
    if (name.length < 0 || !name) {
        return false;
    }
    return !(isNaN(price) || price <= 0);
}


export function validateNameOther(name, other) {
    name = name.trim();
    if (name.length < 0 || !name) {
        return false;
    }
    if (other.length < 0 || !other) {
        return false;
    }
    return true
}


export function validateNameOtherLevel(name, other, level) {
    name = name.trim();
    other = other.trim()
    if (name.length < 0 || !name) {
        return false;
    }
    if (other.length < 0 || !other) {
        return false;
    }
    return !(isNaN(level) || level <= 0);
}