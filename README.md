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
  <li>Docker</li>
  <li>Docker Compose</li>
</ul>
<h3>Инструкция по запуску</h3>
<ol>
  <li><strong>Создать файл конфигурации:</strong><br>
    <pre><code>cp .env.example .env</code></pre>
  </li>
  <li><strong>Запустить приложение:</strong><br>
    <pre><code>docker compose up</code></pre>
  </li>
  <li><strong>Открыть веб-приложение в браузере:</strong><br>
    <a href="http://localhost" target="_blank">http://localhost</a>
  </li>
</ol>
<div>
  <h2>Тестовые данные для входа в систему</h2>
  <ul>
    <li><strong>Администратор</strong>: логин <code>admin</code>, пароль <code>admin123</code></li>
    <li><strong>Менеджер по персоналу</strong>: логин <code>manager</code>, пароль <code>manager123</code></li>
  </ul>
</div>
