<template>
  <UApp>
    <header>
      <h1 class="mb-4 text-3xl font-bold">
        WBSC-PBP-Checker
      </h1>
      <div class="mb-2">
        {{ $t('index.about') }}
      </div>
    </header>
    <NuxtPage />
    <footer>
      <hr>
      <div>
        Visit
        <a href="https://github.com/AloisSeckar/WBSC-PBP-Checker" class="text-blue-600 hover:text-blue-400">
          https://github.com/AloisSeckar/WBSC-PBP-Checker
        </a>
        for more info and contact
      </div>
      <div>
        {{ $t('footer.problem') }}
        <NuxtLink to="/report" class="text-blue-600 hover:text-blue-400">
          {{ $t('footer.report') }}
        </NuxtLink>
      </div>
    </footer>
  </UApp>
</template>
