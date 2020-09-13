# RDF-Modeller

Dieser RDF-Modeller soll nach dem Muster der „Object Document Mapper“ Library Mongoose genutzt werden, um Objekte aus JavaScript in RDF Tripel abzubilden. Dieses Modellierungstool soll dem Nutzer ermöglichen, über JavaScript Objekte mit einem Triplestorezu kommunizieren, um so unter anderem die wichtigsten CRUD Funktionen auszuführen, ohne ein Verständnis über den Aufbau von RDF und SPARQL vorauszusetzen. Durch die Nutzung dieser library kann man mit einem Triplestore interagieren, ohne vorher SPARQL zu lernen und muss sich nur noch mit den Grundprinzipien des Semantic Webs beschäftigen.

## Erstellen eines Schemas zum Modellieren von Ressourcen

```javascript
import { ResourceSchema } from "./ResourceSchema";

const prefixes = {
    "schema": "http://schema.org/",
    "example": "http://example.org/",
};

const ProjectSchema = new ResourceSchema({
    prefixes,
    resourceType: "Project",
    baseURI: prefixes.schema,
    properties: {
        title: { prefix: "example" },
        description: { prefix: "example", optional: true },
    }
});
```

Das erste Object prefix wird genutzt, um bestimmte Abkürzungen auf URIs abzubilden. Diese werden im folgenden für die Identifier der erstellten Ressourcen und Attribute genutzt.
Darauf folgt das Schema. Dafür nutzt man die Klasse ResourceSchema. Sie nimmt das Objekt prexifes, einen Namen für den Typen der Ressourcen, eine Base-URI und ein Objekt, welches die Attribute spezifiziert.

## Erstellen eines Models

```javascript
const request = new RDFRequest("http://localhost:3030/test/query", "http://localhost:3030/test/update");

const Project = RDF.createModel(ProjectSchema, request);
```

Um ein Model zu erstellen, benötigt man ein ResourceSchema und RDFRequest Objekt. Das RDFRequest Objekt braucht die "query" und "update" URL des Triplestores.

## Schema Daten im Triplestore initialisieren

```javascript
await Project.initTupels();
```

Mit dieser Funktion werden im Triplestore Tupel gespeichert, um die im ResourceSchema angegebenen Informationen dort abzubilden. So wird in diesem Beispiel folgendes gespeichert:

```
<http://schema.org/Project> rdf:type rdfs:Class .
<http://example.org/title> rdf:type rdf:Property .
<http://example.org/description> rdf:type rdf:Property
```

## Ressource erstellen und speichern


```javascript
const firstProject = await Project.create({
    identifier: "Project1",
    title: "My first Project",
    description: "This is my very first project, that i am working on."
});

firstProject.save();
```

Mit diesem Aufruf werden folgende Tupel im Triplestore gespeichert:

```
<http://schema.org/Project/Project1> a <http://schema.org/Project> .
<http://schema.org/Project/Project1> ex:title "This is my very first project, that i am working on." .
<http://schema.org/Project/Project1> ex:description "My first Project" .
```

## Nach Ressourcen suchen

```javascript
const allProjects = await Project.find();

const allProjectsFiltered = await Project.find({ title: "My first Project" });

const firstProjectFound = await Project.findOne();

const firstProject = await Project.findByIdentifier("http://schema.org/Project/Project1");
```

Es gibt insgesamt vier Möglichkeiten, um nach bestimmten Ressourcen zu suchen. Es wird jedoch unterschieden zwischen dem Fall, das mehrere Ressourcen gefunden werden können und nur eine. Dafür gibt es zwei verschieden Darstellungen.

```javascript
const allProjects = await Project.find();
/*
{
  '@context': {
    title: { '@id': 'http://example.org/title' },
    description: { '@id': 'http://example.org/description' }
  },
  '@graph': [
    {
      '@id': 'http://schema.org/Project/Project1',
      '@type': 'http://schema.org/Project',
      description: 'This is my very first project, that i am working on.',
      title: 'My first Project',
      save: [Function],
      populate: [Function]
    }
  ],
  populate: [Function]
}
*/

const firstProjectFound = await Project.findOne();
/*
{
  '@context': {
    title: { '@id': 'http://example.org/title' },
    description: { '@id': 'http://example.org/description' }
  },
  '@id': 'http://schema.org/Project/Project1',
  '@type': 'http://schema.org/Project',
  description: 'This is my very first project, that i am working on.',
  title: 'My first Project',
  save: [Function],
  populate: [Function]
}
*/
```

## Löschen von Ressourcen

```javascript
// Löscht alle Ressourcen, die dem Schema vom Project entsprechen
await Project.delete();

await Project.delete({ title: "My first Project" });

await Project.deleteByIdentifier("http://schema.org/Project/Project1");
```

## Bearbeiten von Ressourcen

```javascript
// erster Ansatz
const myProject = await Project.findOne({ title: "My first Project" });
myProject.title = "My first edited title.";
await Project.save();

// zweiter Ansatz
await Project.update({ title: "My first edited title. }, { title: "My first Project" });
```

## Middleware

```javascript
Project.pre("save", (next, values) => {
    if (values) {
        values.title += "EDITED";
    }
    next();
});
```

Es ist möglich, eine Funktion anzugeben, die immer ausgeführt wird, bevor eine Ressource gespeichert wird. In diesem Fall wird der Titel von jeder Project Ressource vor dem Speichern angepasst. Durch den Aufruf von next() geht die normales Ausführung weiter.