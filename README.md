# areal-hr_ext-test
<div>
  <h2>Технические характеристики</h2>
  <p>Используемая ОС - <strong>Ubuntu Desktop 24.04</strong></p>
  <p>IDE - <strong>Webstorm</strong></p>
  <p>Язык для разработки интерфейса - <strong>Vue.js</strong></p>
  <p>Язык для работы с внутренней частью - <strong>NestJS</strong></p>
</div>
<div>
  <h2>База данных</h2>
  <p>Схема базы данных: <a href="database-schema.drawio">database-schema.drawio</a></p>
</div>
<div>
  <h2>Основные git команды в IDE</h2>
  <p><strong>git init</strong> - инициализация репозитория в директории</p>
  <p><strong>git add text.txt</strong> - подготавливает файл к сохранению в истории изменений</p>
  <p><strong>git commit</strong> - фиксирует текущие изменения с комментарием</p>
  <p><strong>git status</strong> - отображает состояние рабочих файлов</p>
  <p><strong>git rm text.txt</strong> - удаляет файл из системы контроля версий</p>
  <p><strong>git reset</strong> - откатывает изменения к предыдущему коммиту</p>
</div>
<h2>Запуск приложения</h2>
<h3>Предварительные требования</h3>
<ul>
  <li>Docker и Docker Compose</li>
  <li>Node.js</li>
  <li>Файл .env в корне проекта (при необходимости скопируйте из .env.example)</li>
</ul>
<h3>Инструкция по запуску</h3>
<ol>
  <li><strong>Запустить PostgreSQL в Docker</strong>
    <pre><code>docker compose up -d</code></pre>
  </li>
  <li><strong>Применить миграции БД</strong>
    <pre><code>cd api</code></pre>
    <pre><code>npx dotenv -e ../.env -- npm run migrate up</code></pre>
  </li>
  <li><strong>Запустить API</strong>
    <pre><code>npm run start:dev</code></pre>
  </li>
  <li><strong>Запустить веб-приложение</strong>
    <pre><code>cd app</code></pre>
    <pre><code>npm run dev</code></pre>
  </li>
</ol>

