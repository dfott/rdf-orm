# RDF-Modeller

Dieser RDF-Modeller soll nach dem Muster der „Object Document Mapper“ library Mongoose genutzt werden, um Objekte aus JavaScript in RDF Tripel abzubilden. Dieses Modellierungstool soll dem Nutzer ermöglichen, über JavaScript Objekte mit einem Triplestorezu kommunizieren, um so unter anderem die wichtigsten CRUD Funktionen auszuführen, ohne ein Verständnis über den Aufbau von RDF und SPARQL vorauszusetzen. Durch die Nutzung dieser library kann man mit einem Triplestore interagieren, ohne vorher SPARQL zu lernen und muss sich nur noch mit den Grundprinzipien des Semantic Webs beschäftigen.

# Erstellen eines Schemas zum Modellieren von Ressourcen

```javascript
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

const request = new RDFRequest("http://localhost:3030/test/query", "http://localhost:3030/test/update");

const Project = RDF.createModel(ProjectSchema, request);
```

