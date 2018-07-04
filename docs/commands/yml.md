# Gok yml

Scope: `Global`

`Gok yml` helps you alter contents of a yaml file, which can provide additional help if you use `kubectl` as your deploy tool.

`Gok yml` supports multiple documents.

## Add/write

### Command: gok yml w [key value] -i input_file -o output_file

This command reads the `input_file`, adds or overwrites the `value` at `key`, writes the result to the `output_file`.

## Delete

### Command: gok yml d [key] -i input_file -o output_file

This command reads the `input_file`, deletes the object at `key`, writes the result to the `output_file`.

## Samples

### Push value to an array

If you have a yaml file:

```yml
Class:
  Math:
    Students:
      - Alice
      - Bob
```

`gok yml w -i input.yaml -o output.yaml Class.Math.Students[+] Carlos`

Will change the content to:

```yml
Class:
  Math:
    Students:
      - Alice
      - Bob
      - Carlos
```

### Change value inside an array

Input:

```yml
friends:
  - name: Alice
    age: 10
  - name: Bob
    age: 20
```

`gok yml w -i input.yaml -o output.yaml friends.0.age[+] 19`

Will change the content to:

```yml
friends:
  - name: Alice
    age: 19
  - name: Bob
    age: 20
```

### Change the key that contains `.`

In some cases, you may want your key having `.`.

Input:

```yml
website:
  www.google.com: valid
```

`gok yml w -i input.yaml -o output.yaml website[www.github.com] valid`

Will change the content to:

```yml
website:
  www.google.com: valid
  www.github.com: valid
```
