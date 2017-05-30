# bf-ui

User interface for the Beachfront project.

## Installing and Developing

```
$ npm install
$ npm run typings:install
$ npm run watch
```

Open browser to `http://localhost:8080`.  Changes will automatically
reload the browser.


## Building

```
npm run build
```

### Environment Variables

| Variable   | Description                                           |
|------------|-------------------------------------------------------|
| `API_ROOT` | A URL pointing at a [`bf-api`](https://github.com/venicegeo/dg-bf-api) instance. |


## Testing

```
$ npm run lint
$ npm run test
$ npm run test:ci  # Will also generate coverage reports
```

