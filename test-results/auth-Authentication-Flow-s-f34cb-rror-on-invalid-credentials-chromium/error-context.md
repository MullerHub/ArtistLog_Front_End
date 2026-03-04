# Page snapshot

```yaml
- generic [active] [ref=e1]:
  - generic [ref=e2]:
    - generic [ref=e3]:
      - img [ref=e5]
      - heading "ArtistLog" [level=1] [ref=e9]
      - paragraph [ref=e10]: Conectando artistas e contratantes
    - generic [ref=e11]:
      - generic [ref=e12]:
        - generic [ref=e13]: Entrar na sua conta
        - generic [ref=e14]: Insira suas credenciais para acessar a plataforma
      - generic [ref=e15]:
        - generic [ref=e16]:
          - generic [ref=e17]:
            - generic [ref=e18]: Email
            - textbox "Email" [ref=e19]:
              - /placeholder: seu@email.com
              - text: nonexistent@email.com
          - generic [ref=e20]:
            - generic [ref=e21]: Senha
            - generic [ref=e22]:
              - textbox "Senha" [ref=e23]:
                - /placeholder: Sua senha
                - text: wrongpassword
              - button "Mostrar senha" [ref=e24] [cursor=pointer]:
                - img
        - generic [ref=e25]:
          - button "Entrar com suas credenciais" [ref=e26] [cursor=pointer]: Entrar
          - paragraph [ref=e27]:
            - text: Nao tem uma conta?
            - link "Criar conta" [ref=e28] [cursor=pointer]:
              - /url: /register
  - region "Notifications alt+T"
  - button "Open Next.js Dev Tools" [ref=e34] [cursor=pointer]:
    - img [ref=e35]
  - alert [ref=e38]
```