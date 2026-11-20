# Seguridad y privacidad

- RLS permanece habilitado; la interfaz nunca sustituye las políticas SQL.
- Las acciones de servidor validan identidad, membresía activa, clínica, rol, permiso y recurso.
- `SUPABASE_SERVICE_ROLE_KEY` solo puede existir en variables privadas y código servidor.
- No se guardan historias clínicas en `localStorage`, `sessionStorage`, IndexedDB ni cachés públicas.
- Formularios públicos son administrativos y rechazan la intención de enviar información clínica.
- El asistente solo atiende información pública y no diagnostica, prescribe ni interpreta resultados.
- Storage clínico debe ser privado y entregar URLs firmadas solo después de comprobar autorización.
- Las notas finalizadas deben ser inmutables en backend; las correcciones se registran como enmiendas.
- Auditoría no debe almacenar secretos ni contenido clínico innecesario.
