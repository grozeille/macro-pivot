# Macro Pivot

## Prepare

UI

```
npm install
```

Python

```
cd python
py -m virtualenv venv
.\venv\Scripts\activate.bat
pip install -r requirements.txt
```

## Build / Test

```
npm start
```

## Package

```
npm run dist
```

## TODO

v1 

* save a file
* add a new package / file
* dirty state of the editor (grayed save button)
* execute a macro if not saved (or save before execute)

v2

* dynamic form for macro input
* python auto-complete
* versionning of the script and diff

![alt text](https://raw.githubusercontent.com/grozeille/macro-pivot/master/screenshot-01.png)
