## Gok yml
Scope: `Global`

`Gok yml` helps you alter content of a yaml file, it provides great help if you use `kubectl` as a deploy tool.

`Gok yml` supports multiple documents yaml.

### Add/write

##### Command: gok yml w [key value] -i input_file -o output_file

This command reads the `input_file`, adds or overwrites the `value` at `key`, after that dumps the result to the `output_file`.

### Delete

##### Command: gok yml d [key] -i input_file -o output_file

This command reads the `input_file`, deletes the object at `key`, after that dumps the result to the `output_file`.

### Samples

##### Push value to an array

If you have a yaml file:
```
Class:
  Math:
    Students:
      - Anna
      - Beth
```

`gok yml w -i input.yaml -o output.yaml Class.Math.Students[+] Christ`

Will change the content to
```
Class:
  Math:
    Students:
      - Anna
      - Beth
      - Christ
```

##### Change value inside an array

Input:
```
friends:
  - name: Anna
    age: 10
  - name: Beth
    age: 20
```

`gok yml w -i input.yaml -o output.yaml friends.0.age[+] 19`

Will change the content to
```
friends:
  - name: Anna
    age: 19
  - name: Beth
    age: 20
```
##### Change the key that has "."

In some cases, you may want your key having "."

Input:
```
website:
  www.google.com: valid
```

`gok yml w -i input.yaml -o output.yaml website[www.github.com] valid`
Will change the content to:
```
website:
  www.google.com: valid
  www.github.com: valid
```
