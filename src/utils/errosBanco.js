export function isUniqueViolation(erro) {
  return erro?.code === "23505";
}

export function isDuplicateEmailError(erro) {
  if (!isUniqueViolation(erro)) {
    return false;
  }

  if (erro.constraint) {
    return erro.constraint === "usuarios_ds_email_key";
  }

  return !erro.detail || erro.detail.includes("ds_email");
}
