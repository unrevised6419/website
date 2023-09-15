---
title: Permission based rendering
published: false
---

Salutare. Azi am facut un refactor la frontend.
Pana acum frontendul se genera pe baza de rolul userului autentificat, acum se va genera pe baza de permisiuni.
La moment acest config de permisiuni per rol e doar in frontend, cu timpul posibil va fi migrat pe backend.
Arata asa https://gist.github.com/iamandrewluca/8fedd0666961a55305dd2b27435436fc
Daca pana acum cand generam o pagina sau un buton indicam ce roluri pot accesa/vedea,
acum doar indic ce permisiune are acel element.
La prima vedere nu e mare diferenta, dar de obicei cand se cere o adaptare de la o acttiune pentru un careva rol
mai ales intr-un proiect care creste, devine complicat sa cauti unde acea actiune poate fi executata si trebuie de schimbat peste tot rolurile noi permise
e.g. butonul de block user poate fi in listing / view / edit ...
Cu permisiuni doar indici acea permisiunea pentru actiunea unui button
dupa care doar avand o sursa de adevar ce rol poate executa acea actiune, e foarte usor de adaptat
Plus mai este problematic deoarece la noi fiecare rol are o prioritate, desi asta nu e corect.
Si in unele locuri nu era indicat un set de roluri necesare, dar era indicat un rol minim care era nevoie.
Si acea actiune era permisa doar rolurilor mai mari, asta cu timpul s-a dovedit a fi "a pain in the ass" mai ales jocul de-a fugărita cu Patrick.
La moment faza cu rolurile dupa prioritate a mai ramas la crearea unui admin, acolo un admin poate crea doar admini cu permsiuni mai joase ca ale lui.
Cel mai corect este sa existe

- un set mare de permisiuni pentru majoritatea actiunilor
- un set de roluri, unde fiecare rol are un set de permisiuni (rolurile nu trebuie sa depinda de alte roluri)
- un user poate avea un set de roluri
  Avand asa arhitectura se poate crea si un editor de roluri/permisiuni pentru useri, unde un admin poate seta aceste permisiuni
  Si sa nu mai bata la cap devii de fiecare data cand le vine auditu :slightly_smiling_face:
  La moment nu tot modulul admin are populat actiunile/paginile cu permisiuni.
  Daca undeva nu este indicat permisiunea atunci orice user autentificat poate accesa (asta tot nu e bine, ca nu putem vedea din config exact un rol la ce actiuni are permis)
  De exemplu permisiunea card:list in linkul de mai sus nu este indicata in Action si nici un rol nu o detine, deoarece card list acum nu e restrictionat la careva rol
  Cu timpul orice actiune trebuie de pus sub permisiune
  Maine voi face un deploy, roq QA sa testeze, daca tot ok.

```
// Exemplu de pagina
// pana acum
<ProtectedRoute
  path={payoutsRoutes.payoutList.url()}
  component={Payouts}
  roles={[AdminUserRole.GTO_SUPERVISOR, AdminUserRole.GTO_SUPER_ADMIN, AdminUserRole.SUPERVISOR]}
  redirect={valueCardsRoutes.url()}
/>
// acum
<ProtectedRoute
  exact path="/"
  canPerform="dashboard:visit"
  component={Dashboard}
  redirect={valueCardsRoutes.url()}
/>

// Exemplu buton
// pana acum
<Protected roles={[AdminUserRole.GTO_SUPERVISOR, AdminUserRole.GTO_SUPER_ADMIN, AdminUserRole.SUPERVISOR]}>
  <Button onClick={blockSingleUser}>
    {user.blocked
      ? l10n('label.unblock')
      : l10n('label.block')}
  </Button>
</Protected>
// acum
<Protected canPerform="user:block">
  <Button onClick={blockSingleUser}>
    {user.blocked
      ? l10n('label.unblock')
      : l10n('label.block')}
  </Button>
</Protected>
```
