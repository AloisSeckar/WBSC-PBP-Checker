<template>
  <UApp>
    <div class="min-h-screen bg-slate-800">
      <header class="border-b border-slate-700 bg-slate-900 shadow-md">
        <div class="mx-auto max-w-5xl px-6 py-5">
          <h1 class="text-3xl font-extrabold tracking-tight text-white">
            <span class="text-accent">WBSC</span>-PBP-Checker
          </h1>
          <p class="mt-1 text-sm text-slate-400">
            {{ $t('header.about') }}
          </p>
        </div>
      </header>
      <main class="mx-auto max-w-5xl px-6 py-8">
        <NuxtPage />
      </main>
      <footer class="mt-12 border-t border-slate-700 bg-slate-900">
        <div class="mx-auto max-w-5xl px-6 py-6 text-sm text-slate-400 space-y-1">
          <div>
            Visit
            <a href="https://github.com/AloisSeckar/WBSC-PBP-Checker" class="font-medium text-accent hover:text-accent-light transition-colors">
              GitHub
            </a>
            for more info and contact
          </div>
          <div>
            {{ $t('footer.problem') }}
            <NuxtLink to="/report" class="font-medium text-accent hover:text-accent-light transition-colors">
              {{ $t('footer.report') }}
            </NuxtLink>
          </div>
        </div>
      </footer>
    </div>
  </UApp>
</template>
