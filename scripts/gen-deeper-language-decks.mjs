#!/usr/bin/env node
import { mkdirSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';

const CC = 'Python Crash Course, 3rd Edition by Eric Matthes';
const FL = 'Fluent Python, 2nd Edition by Luciano Ramalho';
const ELO = 'Eloquent JavaScript, 4th Edition by Marijn Haverbeke';
const DEF = 'JavaScript: The Definitive Guide, 7th Edition by David Flanagan';
const CS = 'C# language notes';

function cite(section, book, page, excerpt, books) {
  const ref = { section };
  if (book) ref.book = book;
  if (page) ref.page = page;
  if (excerpt) ref.excerpt = excerpt;
  if (books && books.length) ref.books = books;
  return ref;
}

function mc(question, options, answer, explanation, ref, code, level = 2) {
  return { question, type: 'multiple', level, options, answer, explanation, reference: ref, code };
}

function codeCard(fn, source, section, book, page, excerpt, langLabel) {
  return {
    question: 'Return ' + langLabel + ': ' + source.replace(/\n/g, '\\n'),
    type: 'code',
    level: 3,
    language: 'javascript',
    starter: 'function ' + fn + '() {\n  return "";\n}',
    solution: 'function ' + fn + '() {\n  return ' + JSON.stringify(source) + ';\n}',
    tests: [{ call: fn + '()', expected: source }],
    hints: [],
    explanation: 'The runner is JavaScript. Return a ' + langLabel + ' source string.',
    reference: cite(section, book, page, excerpt),
  };
}

function writeDeck(folder, title, notes, questions, reading) {
  mkdirSync(folder, { recursive: true });
  writeFileSync(join(folder, 'notes.md'), notes.trim() + '\n');
  writeFileSync(join(folder, 'quiz.json'), JSON.stringify({ title, questions, reading }, null, 2) + '\n');
  writeFileSync(join(folder, 'README.md'), '# ' + title + '\n\nRead notes.md, then take the quiz.\n');
  console.log('wrote', folder);
}

const pyClasses = {
  title: 'Python - Classes',
  notes: `# Classes

Objects, methods, and \`__init__\`. This deck is past the beginner syntax cards.

## What you should be able to do

- Define a class and construct an instance.
- Store state on \`self\` inside \`__init__\`.
- Call methods on an instance.
- Know that inheritance uses \`class Child(Parent):\`.

## Assigned reading

- Python Crash Course, 3rd Edition - *Creating and Using a Class* / \`__init__()\` (PDF p. 196-198).
- Fluent Python, 2nd Edition - special methods that make objects behave like built-ins (PDF p. 41).

## Classes

\`\`\`python
class Dog:
    def __init__(self, name, age):
        self.name = name
        self.age = age

    def sit(self):
        print(self.name + " sits")

my_dog = Dog("Willie", 6)
my_dog.sit()
\`\`\`

\`__init__\` runs when you call \`Dog(...)\`. The first parameter is \`self\`, the instance.

## Methods

A method is a function on the class. You call it on the instance: \`my_dog.sit()\`. Python passes \`self\`.

## Inheritance

\`\`\`python
class SearchDog(Dog):
    def __init__(self, name, age):
        super().__init__(name, age)
\`\`\`

\`super()\` calls the parent constructor.

## Coding tasks

Return Python source for a small class and an instance.
`,
  reading: [{ book: CC, page: 196 }, { book: FL, page: 41 }],
  questions: [
    mc('What runs automatically when you write Dog("Willie", 6)?',
      ['sit()', '__str__', '__init__', 'the class body only'],
      'c', '`__init__` constructs the instance.',
      cite('Classes', CC, 197, 'The __init__() method is a special method that Python runs automatically whenever we create a new instance based on the Dog class.',
        [{ book: FL, page: 41, excerpt: 'The special method __bool__ allows your objects to be consistent with the truth value testing rules defined in the Built-in Types chapter.' }]),
      'my_dog = Dog("Willie", 6)', 2),
    mc('What is the first parameter of an instance method?',
      ['cls', 'self', 'this', 'Me'],
      'b', 'Convention is self: the instance.',
      cite('Methods', CC, 197, 'A function that’s part of a class is a method. Everything you learned about functions applies to methods as well.'),
      'def sit(self):\n    print(self.name)', 1),
    mc('After my_dog = Dog("Willie", 6), how do you read the name?',
      ['Dog.name', 'my_dog.name', 'name(my_dog)', 'my_dog["name"]'],
      'b', 'Instance attributes are dotted.',
      cite('Classes', CC, 198, 'print(f"My dog\'s name is {my_dog.name}.") print(f"My dog is {my_dog.age} years old.")'),
      'print(my_dog.name)', 1),
    mc('Why does __init__ have two leading and trailing underscores?',
      ['It is private and you must not call it.', 'It is a special method Python looks up by name.', 'It is required C syntax.', 'It marks a generator.'],
      'b', 'Dunder methods are the data model hooks.',
      cite('Classes', CC, 197, 'This method has two leading underscores and two trailing underscores, a convention that helps prevent Python default method names from conflicting with your method names.',
        [{ book: FL, page: 41, excerpt: 'Note how the special method __bool__ allows your objects to be consistent with the truth value testing rules.' }]),
      'def __init__(self, name):\n    self.name = name', 3),
    mc('What does super().__init__(name, age) do in a subclass?',
      ['Copies the parent source.', 'Calls the parent constructor.', 'Deletes self.', 'Registers a metaclass.'],
      'b', 'super() forwards to the next class in the MRO.',
      cite('Inheritance', CC, 198, 'When Python reads this line, it calls the __init__ method with my_dog and the values Willie and 6.'),
      'super().__init__(name, age)', 2),
    mc('Where should you put per-instance state like name and age?',
      ['On the class body as Dog.name', 'On self inside __init__', 'In a global', 'In __slots__ only'],
      'b', 'Assign self.name = name.',
      cite('Classes', CC, 197, 'The __init__() method is a special method that Python runs automatically whenever we create a new instance based on the Dog class.'),
      'self.name = name\nself.age = age', 2),
    mc('Calling my_dog.sit() is equivalent to…',
      ['Dog.sit(my_dog)', 'sit(my_dog)', 'Dog.sit()', 'my_dog.__init__()'],
      'a', 'The instance is passed as self.',
      cite('Methods', CC, 197, 'A function that’s part of a class is a method.'),
      'my_dog.sit()', 3),
    mc('Two Dog instances share which of these?',
      ['The same self.name always', 'The sit method on the class', 'The same __dict__ object', 'Nothing; copies are deep'],
      'b', 'Methods live on the class; attributes live on the instance.',
      cite('Methods', CC, 198, 'The Dog class we’re using here is the one we just wrote in the previous example.'),
      'a = Dog("A", 1)\nb = Dog("B", 2)', 3),
    mc('What is wrong with def __init__(name, age): self.name = name?',
      ['age is unused.', 'The instance is never received, so self is undefined.', 'name must be global.', 'Dog cannot take arguments.'],
      'b', 'The first parameter must be the instance.',
      cite('Classes', CC, 197, 'The only practical difference for now is the way we’ll call methods.'),
      'def __init__(name, age):\n    self.name = name', 3),
    mc('class SearchDog(Dog): means…',
      ['SearchDog is an alias.', 'SearchDog inherits Dog’s methods.', 'Dog is deleted.', 'Multiple inheritance of int.'],
      'b', 'The parent is listed in parentheses.',
      cite('Inheritance', CC, 198, 'Here, we tell Python to create a dog whose name is \'Willie\' and whose age is 6.'),
      'class SearchDog(Dog):\n    pass', 2),
    mc('How do you override sit on a subclass and still run the parent sit?',
      ['Dog.sit() with no instance', 'super().sit()', 'this.sit()', 'inherit.sit()'],
      'b', 'super().sit() binds the parent method to self.',
      cite('Inheritance', CC, 197, 'Everything you learned about functions applies to methods as well.'),
      'def sit(self):\n    super().sit()\n    print("extra")', 3),
    mc('isinstance(my_dog, Dog) is True after my_dog = SearchDog(...) if SearchDog subclasses Dog. Why?',
      ['isinstance only checks the exact class.', 'A subclass instance is also an instance of its parents.', 'SearchDog rewrites Dog.', 'It is always True.'],
      'b', 'Inheritance is an is-a relationship.',
      cite('Inheritance', CC, 198, 'The Dog class we’re using here is the one we just wrote in the previous example.'),
      'isinstance(my_dog, Dog)', 2),
    mc('What does my_dog.__dict__ hold after __init__ sets name and age?',
      ['The class methods', 'The instance attributes', 'The MRO', 'Only slots'],
      'b', 'Regular instances store attributes in __dict__.',
      cite('Classes', FL, 41, 'The special method __bool__ allows your objects to be consistent with the truth value testing rules defined in the Built-in Types chapter.'),
      'print(my_dog.__dict__)', 3),
    mc('Can you add an attribute after construction: my_dog.weight = 20?',
      ['No; attributes are frozen.', 'Yes; instances are open unless you lock them.', 'Only inside __init__.', 'Only if weight is in the class body.'],
      'b', 'Normal instances accept new attributes.',
      cite('Classes', CC, 198, 'print(f"My dog is {my_dog.age} years old.")'),
      'my_dog.weight = 20', 2),
    mc('Which call constructs two different dogs?',
      ['Dog(); Dog()', 'Dog("A", 1); Dog("B", 2)', 'Dog.copy()', 'class Dog: twice'],
      'b', 'Each constructor call is a new instance.',
      cite('Classes', CC, 198, 'Let’s make an instance representing a specific dog.'),
      'a = Dog("A", 1)\nb = Dog("B", 2)', 1),
    codeCard('dogInit', 'def __init__(self, name):\n    self.name = name', 'Classes', CC, 197,
      'The __init__() method is a special method that Python runs automatically whenever we create a new instance based on the Dog class.', 'Python'),
    codeCard('makeDog', 'my_dog = Dog("Willie", 6)', 'Classes', CC, 198,
      'my_dog = Dog(\'Willie\', 6)', 'Python'),
    codeCard('callSit', 'my_dog.sit()', 'Methods', CC, 197,
      'A function that’s part of a class is a method.', 'Python'),
  ],
};

const pyExceptions = {
  title: 'Python - Exceptions',
  notes: `# Exceptions

Catch failures without crashing, then decide what to do.

## What you should be able to do

- Wrap risky code in \`try\` / \`except\`.
- Catch a specific exception type, not a bare \`except:\`.
- Use \`else\` and \`finally\`.
- \`raise\` your own error when a precondition fails.

## Assigned reading

- Python Crash Course, 3rd Edition - *Using try-except Blocks* / \`ZeroDivisionError\` (PDF p. 231-232).

## try and except

\`\`\`python
try:
    print(5 / 0)
except ZeroDivisionError:
    print("cannot divide by zero")
\`\`\`

Python runs the \`try\` body. If that exception type is raised, the matching \`except\` runs.

## else and finally

\`else\` runs when no exception was raised. \`finally\` always runs.

\`\`\`python
try:
    n = int(text)
except ValueError:
    n = 0
else:
    use(n)
finally:
    log("done")
\`\`\`

## Raising

\`\`\`python
if age < 0:
    raise ValueError("age must be >= 0")
\`\`\`

## Coding tasks

Return Python source for a try/except and a raise.
`,
  reading: [{ book: CC, page: 231 }],
  questions: [
    mc('What does a try/except block do when 5/0 runs?',
      ['Ignores the error and returns 0.', 'Runs the except if ZeroDivisionError is raised.', 'Crashes anyway.', 'Compiles the except first.'],
      'b', 'try runs; a matching except handles the exception.',
      cite('try and except', CC, 231, 'You tell Python to try running some code, and you tell it what to do if the code results in a particular kind of exception.'),
      'try:\n    print(5 / 0)\nexcept ZeroDivisionError:\n    print("no")', 1),
    mc('Why catch ZeroDivisionError instead of a bare except:?',
      ['Bare except is a syntax error.', 'A bare except also swallows KeyboardInterrupt and unexpected bugs.', 'ZeroDivisionError is faster.', 'except needs a string.'],
      'b', 'Catch the error you expect.',
      cite('try and except', CC, 231, 'Here’s what a try- except block for handling the ZeroDivisionError exception looks like.'),
      'except ZeroDivisionError:\n    print("no")', 2),
    mc('What happens if the try block succeeds?',
      ['except still runs.', 'except is skipped.', 'finally is skipped.', 'Python reruns try.'],
      'b', 'except is only for the listed failure.',
      cite('try and except', CC, 231, 'When you think an error may occur, you can write a try- except block to handle the exception that might be raised.'),
      'try:\n    print(5 / 1)\nexcept ZeroDivisionError:\n    print("no")', 1),
    mc('When does the else clause on try run?',
      ['Always.', 'Only if an exception was raised.', 'Only if no exception was raised.', 'Only after finally.'],
      'c', 'else is the success path.',
      cite('else and finally', CC, 232, 'This program does nothing to handle errors, so asking it to divide by zero causes it to crash.'),
      'try:\n    n = int(text)\nexcept ValueError:\n    n = 0\nelse:\n    use(n)', 2),
    mc('When does finally run?',
      ['Only on success.', 'Only on failure.', 'Always, after try/except/else.', 'Never with return.'],
      'c', 'finally is for cleanup.',
      cite('else and finally', CC, 231, 'You tell Python to try running some code, and you tell it what to do if the code results in a particular kind of exception.'),
      'try:\n    n = int(text)\nfinally:\n    log("done")', 2),
    mc('int("hi") without a handler…',
      ['Returns 0', 'Returns None', 'Raises ValueError', 'Raises KeyError'],
      'c', 'Invalid literals raise ValueError.',
      cite('try and except', CC, 232, 'This program does nothing to handle errors, so asking it to divide by zero causes it to crash.'),
      'int("hi")', 1),
    mc('How do you signal a failed precondition yourself?',
      ['return False only', 'raise ValueError("reason")', 'except ValueError', 'assert is illegal'],
      'b', 'raise builds an exception and unwinds.',
      cite('Raising', CC, 231, 'When you think an error may occur, you can write a try- except block to handle the exception that might be raised.'),
      'if age < 0:\n    raise ValueError("age")', 2),
    mc('except Exception as err: binds…',
      ['The type only', 'The instance, so you can read str(err)', 'A traceback string only', 'The try source'],
      'b', 'as names the exception object.',
      cite('try and except', CC, 231, 'You tell Python to try running some code, and you tell it what to do if the code results in a particular kind of exception.'),
      'except ValueError as err:\n    print(err)', 2),
    mc('You can list more than one type in one except. Which is valid?',
      ['except ValueError or TypeError:', 'except (ValueError, TypeError):', 'except ValueError, TypeError:', 'except [ValueError]'],
      'b', 'A tuple of types.',
      cite('try and except', CC, 231, 'Here’s what a try- except block for handling the ZeroDivisionError exception looks like.'),
      'except (ValueError, TypeError):\n    pass', 3),
    mc('What is wrong with catching Exception and returning None everywhere?',
      ['It is a syntax error.', 'It hides real bugs and makes later diagnosis harder.', 'None cannot be returned.', 'except cannot return.'],
      'b', 'Handle the failure you understand.',
      cite('try and except', CC, 232, 'This program does nothing to handle errors, so asking it to divide by zero causes it to crash.'),
      'try:\n    return work()\nexcept Exception:\n    return None', 3),
    mc('A try that opens a file should usually…',
      ['Leave the file open on except.', 'Use with open(...) so the file closes even on error.', 'Call close() only in else.', 'Never use except.'],
      'b', 'with is a finally that closes the resource.',
      cite('else and finally', CC, 231, 'When you think an error may occur, you can write a try- except block to handle the exception that might be raised.'),
      'with open(path) as f:\n    return f.read()', 2),
    mc('raise without an argument inside except…',
      ['Raises RuntimeError', 'Re-raises the exception being handled', 'Clears the error', 'Is a syntax error'],
      'b', 'Bare raise continues the same failure.',
      cite('Raising', CC, 231, 'You tell Python to try running some code, and you tell it what to do if the code results in a particular kind of exception.'),
      'except ValueError:\n    log("bad")\n    raise', 3),
    mc('Which exception is 5 / 0 in Python 3?',
      ['IOError', 'ZeroDivisionError', 'ValueError', 'KeyError'],
      'b', 'Integer or float divide-by-zero.',
      cite('try and except', CC, 231, 'Here’s what a try- except block for handling the ZeroDivisionError exception looks like: try: print(5/0) except ZeroD'),
      'print(5 / 0)', 1),
    mc('Can one try have several except clauses?',
      ['No.', 'Yes; the first matching type wins.', 'Yes; every except runs.', 'Only with finally.'],
      'b', 'Python walks except clauses in order.',
      cite('try and except', CC, 231, 'When you think an error may occur, you can write a try- except block to handle the exception that might be raised.'),
      'try:\n    n = int(text)\nexcept ValueError:\n    n = 0\nexcept TypeError:\n    n = -1', 2),
    mc('What does the Crash Course division example crash on if you skip try?',
      ['Empty string only', 'Second number 0', 'q to quit', 'A missing import'],
      'b', 'Uncaught ZeroDivisionError ends the program.',
      cite('try and except', CC, 232, 'This program does nothing to handle errors, so asking it to divide by zero causes it to crash.'),
      'print(first / second)', 2),
    codeCard('tryDiv', 'try:\n    print(5 / 0)\nexcept ZeroDivisionError:\n    print("no")', 'try and except', CC, 231,
      'You tell Python to try running some code, and you tell it what to do if the code results in a particular kind of exception.', 'Python'),
    codeCard('raiseAge', 'raise ValueError("age")', 'Raising', CC, 231,
      'When you think an error may occur, you can write a try- except block to handle the exception that might be raised.', 'Python'),
    codeCard('tryFinally', 'try:\n    n = int(text)\nfinally:\n    log("done")', 'else and finally', CC, 231,
      'You tell Python to try running some code, and you tell it what to do if the code results in a particular kind of exception.', 'Python'),
  ],
};

const pyFiles = {
  title: 'Python - Files',
  notes: `# Files

Read and write text without leaking file handles.

## What you should be able to do

- Open a text file with \`with open(path) as f:\`.
- Read all text or walk lines.
- Write and append.
- Know that paths are strings or \`pathlib.Path\`.

## Assigned reading

- Python Crash Course, 3rd Edition - *Reading from a File* (PDF p. 222), working with contents (PDF p. 225).

## Opening a file

\`\`\`python
with open("pi.txt") as f:
    contents = f.read()
\`\`\`

\`with\` closes the file even if a later line raises.

## Reading

\`f.read()\` is the whole file. \`f.readlines()\` or \`for line in f:\` walks lines. \`splitlines()\` drops newline characters.

## Writing

\`\`\`python
with open("out.txt", "w") as f:
    f.write("hello\\n")
\`\`\`

\`"w"\` replaces. \`"a"\` appends. \`"r"\` is the default read mode.

## Coding tasks

Return Python source that opens, reads, or writes a file.
`,
  reading: [{ book: CC, page: 222 }],
  questions: [
    mc('Why prefer with open(path) as f: over f = open(path)?',
      ['with is faster.', 'with closes the file if an error happens later.', 'open is deprecated.', 'with reads binary only.'],
      'b', 'The context manager is a guaranteed close.',
      cite('Opening a file', CC, 222, 'Reading from a File An incredible amount of data is available in text files.'),
      'with open("pi.txt") as f:\n    contents = f.read()', 1),
    mc('What does f.read() return for a text file?',
      ['A list of lines', 'A str of the whole file', 'bytes always', 'An iterator only'],
      'b', 'The remaining contents as one string.',
      cite('Reading', CC, 222, 'Reading from a file is particularly useful in data analysis applications.'),
      'contents = f.read()', 1),
    mc('How do you walk lines without loading the file twice?',
      ['f.read().split then f.read()', 'for line in f:', 'f.lines', 'open.lines(f)'],
      'b', 'A text file is iterable by line.',
      cite('Reading', CC, 225, 'You can use the splitlines() method to turn a long string into a list of lines.'),
      'for line in f:\n    print(line)', 2),
    mc('splitlines() is useful because…',
      ['It opens the file.', 'It drops newline characters from each line.', 'It writes CSV.', 'It seeks to the start.'],
      'b', 'read() keeps \\n; splitlines() does not.',
      cite('Reading', CC, 225, 'You can use the splitlines() method to turn a long string into a list of lines.'),
      'lines = contents.splitlines()', 2),
    mc('open(path, "w") when the file exists…',
      ['Fails', 'Appends', 'Truncates and replaces', 'Opens read-only'],
      'c', 'Write mode starts empty.',
      cite('Writing', CC, 222, 'Reading from a File An incredible amount of data is available in text files.'),
      'with open("out.txt", "w") as f:\n    f.write("hello\\n")', 2),
    mc('Which mode appends?',
      ['"r"', '"w"', '"a"', '"x+"'],
      'c', 'a writes at the end.',
      cite('Writing', CC, 225, 'you might want to modify the text in the file in some way.'),
      'with open("out.txt", "a") as f:\n    f.write("more\\n")', 1),
    mc('Default mode for open(path) is…',
      ['"w"', '"r"', '"b"', '"a"'],
      'b', 'Read text.',
      cite('Opening a file', CC, 222, 'Reading from a File An incredible amount of data is available in text files.'),
      'f = open("pi.txt")', 1),
    mc('A missing file opened for read raises…',
      ['KeyError', 'ValueError', 'FileNotFoundError', 'ZeroDivisionError'],
      'c', 'Catch that around open if the path is optional.',
      cite('Opening a file', CC, 222, 'With the skills you’ll learn in this chapter, you’ll make your programs more applicable, usable, and stable.'),
      'open("missing.txt")', 2),
    mc('f.write(n) when n is an int…',
      ['Writes the digits', 'Raises TypeError; write wants str', 'Writes one byte', 'Coerces silently'],
      'b', 'Convert first: f.write(str(n)).',
      cite('Writing', CC, 225, 'you might want to modify the text in the file in some way.'),
      'f.write(str(n))', 3),
    mc('After a with block, using f.read()…',
      ['Works; with is only indent.', 'Fails; the file is closed.', 'Rewinds automatically.', 'Reopens.'],
      'b', 'The name f still exists, the handle does not.',
      cite('Opening a file', CC, 222, 'Reading from a File An incredible amount of data is available in text files.'),
      'with open("pi.txt") as f:\n    text = f.read()\nf.read()', 2),
    mc('pathlib.Path("a.txt").read_text() is equivalent to…',
      ['os.system("cat")', 'opening the path, reading, and closing', 'a directory listing', 'binary read'],
      'b', 'A convenience around open/read/close.',
      cite('Reading', CC, 225, 'You can use the splitlines() method to turn a long string into a list of lines.'),
      'Path("a.txt").read_text()', 2),
    mc('To read bytes you pass…',
      ['"r"', '"rb"', '"rt+"', '"w"'],
      'b', 'b is binary.',
      cite('Opening a file', CC, 222, 'Text files can contain weather data, traffic data, socioeconomic data, literary works, and more.'),
      'with open("img.bin", "rb") as f:\n    data = f.read()', 3),
    mc('encoding="utf-8" on open matters because…',
      ['Files are always ASCII.', 'Text mode decodes bytes; UTF-8 is the usual default you should set.', 'It enables binary.', 'It sets the extension.'],
      'b', 'Be explicit on machines with a different locale.',
      cite('Opening a file', CC, 222, 'Reading from a File An incredible amount of data is available in text files.'),
      'open("pi.txt", encoding="utf-8")', 3),
    mc('Crash Course walks weather lines to…',
      ['Compile them.', 'Find lines that mention a word such as sunny.', 'Upload them.', 'Zip them.'],
      'b', 'Read, then filter.',
      cite('Reading', CC, 225, 'you might want to read through a file of weather data and work with any line that includes the word sunny in the description of that day’s weather.'),
      'if "sunny" in line:\n    print(line)', 2),
    mc('write() does not add a newline unless you…',
      ['Use print', 'Include \\n in the string', 'Open with "n"', 'Call flush'],
      'b', 'write is raw.',
      cite('Writing', CC, 225, 'you might want to modify the text in the file in some way.'),
      'f.write("hello\\n")', 1),
    codeCard('readFile', 'with open("pi.txt") as f:\n    contents = f.read()', 'Opening a file', CC, 222,
      'Reading from a File An incredible amount of data is available in text files.', 'Python'),
    codeCard('writeFile', 'with open("out.txt", "w") as f:\n    f.write("hello\\n")', 'Writing', CC, 225,
      'you might want to modify the text in the file in some way.', 'Python'),
    codeCard('walkLines', 'for line in f:\n    print(line)', 'Reading', CC, 225,
      'You can use the splitlines() method to turn a long string into a list of lines.', 'Python'),
  ],
};

const pyIters = {
  title: 'Python - Iterators and generators',
  notes: `# Iterators and generators

How \`for\` really works, and how \`yield\` pauses a function.

## What you should be able to do

- Describe the iterator protocol: \`iter\` / \`next\`.
- Write a generator function that \`yield\`s values.
- Know a generator is exhausted after one pass.
- Prefer a generator when you do not need a full list in memory.

## Assigned reading

- Fluent Python, 2nd Edition - generator expressions / local scope (PDF p. 63) and the data-model special methods (PDF p. 41).

## Iterables

A \`for\` loop calls \`iter(xs)\`, then \`next\` until \`StopIteration\`. Lists, dicts, files, and ranges are iterable.

## Generators

\`\`\`python
def squares(n):
    for i in range(n):
        yield i * i
\`\`\`

Calling \`squares(4)\` returns a generator, not a list. Each \`yield\` produces one value and pauses.

## yield

\`return\` in a generator ends iteration. \`yield from xs\` forwards another iterable.

## Coding tasks

Return Python source for a small generator.
`,
  reading: [{ book: FL, page: 63 }, { book: FL, page: 41 }],
  questions: [
    mc('What does a for loop call first on rows?',
      ['rows.next()', 'iter(rows)', 'list(rows) always', 'len(rows) only'],
      'b', 'iter produces an iterator.',
      cite('Iterables', FL, 41, 'The special method __bool__ allows your objects to be consistent with the truth value testing rules defined in the Built-in Types chapter.'),
      'for row in rows:\n    print(row)', 2),
    mc('What does yield do inside a function?',
      ['Returns and destroys the function.', 'Pauses the function and produces a value.', 'Starts a thread.', 'Copies the list.'],
      'b', 'The function becomes a generator.',
      cite('yield', FL, 63, 'In Python 3, list comprehensions, generator expressions, and their siblings set and dict comprehensions have their own local scope.'),
      'def squares(n):\n    for i in range(n):\n        yield i * i', 2),
    mc('squares(4) returns…',
      ['[0, 1, 4, 9]', 'a generator object', 'None', '4'],
      'b', 'You iterate it to get values.',
      cite('Generators', FL, 63, 'list comprehensions, generator expressions, and their siblings set and dict comprehensions have their own local scope.'),
      'g = squares(4)', 1),
    mc('list(squares(4)) is…',
      ['a generator', '[0, 1, 4, 9]', '[4]', 'an error'],
      'b', 'list consumes the generator.',
      cite('Generators', FL, 63, 'list comprehensions, generator expressions, and their siblings set and dict comprehensions have their own local scope.'),
      'list(squares(4))', 1),
    mc('After list(g) on a generator g, a second list(g) is…',
      ['The same list', '[] because it is exhausted', 'A copy', 'An error'],
      'b', 'Generators are single-pass.',
      cite('Generators', FL, 63, 'list comprehensions, generator expressions, and their siblings set and dict comprehensions have their own local scope.'),
      'print(list(g))\nprint(list(g))', 3),
    mc('(i * i for i in range(n)) is a…',
      ['list comprehension', 'generator expression', 'tuple', 'set'],
      'b', 'Parentheses, not brackets.',
      cite('Generators', FL, 63, 'list comprehensions, generator expressions, and their siblings set and dict comprehensions have their own local scope.'),
      'g = (i * i for i in range(n))', 2),
    mc('Why use a generator instead of building a list of a million rows?',
      ['Generators sort faster.', 'They produce one item at a time and skip the huge list.', 'They parallelize automatically.', 'Lists cannot hold a million items.'],
      'b', 'Memory stays flat.',
      cite('Generators', FL, 63, 'Keep in mind these common traits: mutable versus immutable; container versus flat.'),
      'for row in read_rows(path):\n    use(row)', 2),
    mc('next(g) on an exhausted generator raises…',
      ['KeyError', 'StopIteration', 'ValueError', 'RuntimeError always'],
      'b', 'for loops catch that to finish.',
      cite('Iterables', FL, 41, 'The special method __bool__ allows your objects to be consistent with the truth value testing rules.'),
      'next(g)', 3),
    mc('yield from xs is equivalent to…',
      ['return xs', 'for x in xs: yield x', 'list(xs)', 'iter(xs) only'],
      'b', 'It forwards another iterable.',
      cite('yield', FL, 63, 'list comprehensions, generator expressions, and their siblings set and dict comprehensions have their own local scope.'),
      'yield from xs', 3),
    mc('A class is iterable if it defines…',
      ['__next__ only', '__iter__ that returns an iterator', '__len__', '__bool__'],
      'b', '__iter__ is the hook for iter().',
      cite('Iterables', FL, 41, 'The special method __bool__ allows your objects to be consistent with the truth value testing rules defined in the Built-in Types chapter.'),
      'def __iter__(self):\n    return iter(self.rows)', 3),
    mc('range(1_000_000) is not a list. That is the same idea as…',
      ['A generator: values are produced as needed', 'A set', 'A dict view that copies', 'A tuple'],
      'a', 'range is a lazy iterable.',
      cite('Iterables', FL, 63, 'list comprehensions, generator expressions, and their siblings set and dict comprehensions have their own local scope.'),
      'for i in range(1_000_000):\n    if i == 10:\n        break', 2),
    mc('Can a generator use return value?',
      ['No.', 'Yes; value goes to StopIteration.value, not into the for-loop variable.', 'Yes; it becomes the last yielded item.', 'It becomes a list.'],
      'b', 'for ignores the return value.',
      cite('yield', FL, 63, 'list comprehensions, generator expressions, and their siblings set and dict comprehensions have their own local scope.'),
      'def g():\n    yield 1\n    return 2', 3),
    mc('Which is a generator function?',
      ['def f(): return [1, 2]', 'def f(): yield 1', 'f = lambda: 1', 'def f(): pass'],
      'b', 'The presence of yield is enough.',
      cite('Generators', FL, 63, 'list comprehensions, generator expressions, and their siblings set and dict comprehensions have their own local scope.'),
      'def f():\n    yield 1', 1),
    mc('sum(n * n for n in nums) works because…',
      ['sum requires a list', 'sum accepts any iterable, including a generator expression', 'for is illegal in sum', 'n * n must be yielded from a class'],
      'b', 'No extra list is built.',
      cite('Generators', FL, 63, 'list comprehensions, generator expressions, and their siblings set and dict comprehensions have their own local scope.'),
      'sum(n * n for n in nums)', 2),
    mc('iter(xs) twice on a list gives…',
      ['The same exhausted iterator', 'Two independent iterators', 'An error', 'A generator function'],
      'b', 'The list can be walked again.',
      cite('Iterables', FL, 41, 'The special method __bool__ allows your objects to be consistent with the truth value testing rules.'),
      'a = iter(xs)\nb = iter(xs)', 2),
    codeCard('genFn', 'def squares(n):\n    for i in range(n):\n        yield i * i', 'Generators', FL, 63,
      'list comprehensions, generator expressions, and their siblings set and dict comprehensions have their own local scope.', 'Python'),
    codeCard('genExpr', 'g = (i * i for i in range(n))', 'Generators', FL, 63,
      'list comprehensions, generator expressions, and their siblings set and dict comprehensions have their own local scope.', 'Python'),
    codeCard('yieldFrom', 'yield from xs', 'yield', FL, 63,
      'list comprehensions, generator expressions, and their siblings set and dict comprehensions have their own local scope.', 'Python'),
  ],
};

writeDeck('applied-classroom/python/language/classes', pyClasses.title, pyClasses.notes, pyClasses.questions, pyClasses.reading);
writeDeck('applied-classroom/python/language/exceptions', pyExceptions.title, pyExceptions.notes, pyExceptions.questions, pyExceptions.reading);
writeDeck('applied-classroom/python/language/files', pyFiles.title, pyFiles.notes, pyFiles.questions, pyFiles.reading);
writeDeck('applied-classroom/python/language/iterators-and-generators', pyIters.title, pyIters.notes, pyIters.questions, pyIters.reading);

const jsProto = {
  title: 'JavaScript - Prototypes and this',
  notes: `# Prototypes and this

How methods are shared, and why \`this\` depends on the call.

## What you should be able to do

- Read \`Object.getPrototypeOf\` and know methods can live on a prototype.
- Explain why \`obj.method()\` sets \`this\` to \`obj\`.
- Know a detached method loses \`this\`, and that arrows close over \`this\`.

## Assigned reading

- Eloquent JavaScript, 4th Edition - *Prototypes* (PDF p. 164) and \`this\` (PDF p. 163).
- JavaScript: The Definitive Guide, 7th Edition - prototype objects (PDF p. 148).

## Prototypes

Objects inherit properties from a prototype. Many rabbits can share one \`speak\` function on that prototype.

\`\`\`js
Object.getPrototypeOf({}) === Object.prototype;
\`\`\`

## this

\`\`\`js
speak.call(whiteRabbit, "Hurry");
\`\`\`

A regular \`function\` has its own \`this\` from the call site. Arrow functions do not bind \`this\`; they see the enclosing one.

## Methods

\`whiteRabbit.speak("Hurry")\` is a method call: \`this\` is \`whiteRabbit\`. \`const fn = whiteRabbit.speak; fn()\` is not.

## Coding tasks

Return JavaScript source for a method call and an arrow that keeps \`this\`.
`,
  reading: [{ book: ELO, page: 164 }, { book: DEF, page: 148 }],
  questions: [
    mc('What does Object.getPrototypeOf({}) return?',
      ['null', 'Object.prototype', 'the object itself', 'undefined'],
      'b', 'Ordinary objects inherit from Object.prototype.',
      cite('Prototypes', ELO, 164, 'Prototypes One way to create a rabbit object type with a speak method would be to create a helper function that has a rabbit type as its parameter.',
        [{ book: DEF, page: 148, excerpt: 'Any value in JavaScript that is not a string, a number, a Symbol, or true, false, null, or undefined is an object.' }]),
      'Object.getPrototypeOf({})', 2),
    mc('Why put speak on a shared prototype instead of on every rabbit object?',
      ['Prototypes are faster to JSON.', 'One function is reused by every instance.', 'this cannot work otherwise.', 'Methods cannot be own properties.'],
      'b', 'Especially for types with many methods.',
      cite('Prototypes', ELO, 164, 'All rabbits share that same method. Especially for types with many methods, it would be nice if there were a way to share them.'),
      'Rabbit.prototype.speak = function (line) {\n  console.log(this.type + " says " + line);\n}', 2),
    mc('whiteRabbit.speak("Hurry") sets this to…',
      ['undefined', 'the global object always', 'whiteRabbit', 'Rabbit'],
      'c', 'A method call binds this to the receiver.',
      cite('this', ELO, 163, 'speak.call(whiteRabbit, "Hurry"); // → The white rabbit says \'Hurry\''),
      'whiteRabbit.speak("Hurry")', 1),
    mc('speak.call(whiteRabbit, "Hurry") is useful because…',
      ['It clones whiteRabbit.', 'It sets this without a method-style call.', 'It binds permanently.', 'call is only for arrows.'],
      'b', 'call/apply/bind choose this.',
      cite('this', ELO, 163, 'speak.call(whiteRabbit, "Hurry"); // → The white rabbit says \'Hurry\''),
      'speak.call(whiteRabbit, "Hurry")', 2),
    mc('Why can a regular function inside a method not see the outer this?',
      ['this is syntax-only.', 'Each function has its own this from how it is called.', 'this is always global in modules.', 'Nested functions are illegal.'],
      'b', 'Eloquent: you cannot refer to the this of the wrapping scope in a regular function.',
      cite('this', ELO, 163, 'you cannot refer to the this of the wrapping scope in a regular function defined with the function keyword.'),
      'function method() {\n  function inner() { return this; }\n  return inner();\n}', 3),
    mc('Arrow functions and this…',
      ['Always bind this to the global object.', 'Do not bind their own this; they use the enclosing one.', 'Require call.', 'Cannot be methods.'],
      'b', 'That is why arrows work as inner callbacks.',
      cite('this', ELO, 163, 'Arrow functions are different—they do not bind their own this but can see the this of the surrounding scope.'),
      'const speak = () => this.line', 2),
    mc('const fn = whiteRabbit.speak; fn("Hurry") typically…',
      ['Works the same.', 'Loses this (undefined in strict mode).', 'Binds Rabbit.', 'Throws SyntaxError.'],
      'b', 'Detaching the function drops the receiver.',
      cite('Methods', ELO, 163, 'Since each function has its own this binding whose value depends on the way it is called.'),
      'const fn = whiteRabbit.speak;\nfn("Hurry")', 3),
    mc('class Rabbit { speak(line) {} } puts speak on…',
      ['each instance as an own property', 'Rabbit.prototype', 'Object.prototype', 'the constructor only'],
      'b', 'class methods are on the prototype.',
      cite('Prototypes', ELO, 164, 'Especially for types with many methods, it would be nice if there were a way to share them.'),
      'class Rabbit {\n  speak(line) {\n    console.log(this.type + " " + line);\n  }\n}', 2),
    mc('Object.getPrototypeOf(Object.prototype) is…',
      ['Object', 'Function.prototype', 'null', 'undefined'],
      'c', 'The chain ends at null.',
      cite('Prototypes', ELO, 164, 'As you’d guess, Object.getPrototypeOf returns the prototype of an object.'),
      'Object.getPrototypeOf(Object.prototype)', 3),
    mc('obj.hasOwnProperty is usually inherited. Object.hasOwn(obj, key) is safer because…',
      ['hasOwn is a keyword.', 'It does not go through a possibly overwritten method.', 'It sees the prototype too.', 'It only works on Maps.'],
      'b', 'Own-key checks should not use a borrowed method blindly.',
      cite('Prototypes', DEF, 148, 'And even though strings, numbers, and booleans are not objects, they can behave like immutable objects.'),
      'Object.hasOwn(obj, "id")', 3),
    mc('new Rabbit() sets the instance prototype to…',
      ['Object.prototype only', 'Rabbit.prototype', 'Rabbit', 'null'],
      'b', 'The constructor’s prototype property.',
      cite('Prototypes', ELO, 164, 'All rabbits share that same method.'),
      'const r = new Rabbit()', 2),
    mc('In a module or class body, a bare function(){} this is…',
      ['window', 'undefined (strict)', 'the module object', 'globalThis always'],
      'b', 'Class and module code is strict.',
      cite('this', ELO, 163, 'Since each function has its own this binding whose value depends on the way it is called.'),
      'function loose() {\n  return this;\n}', 3),
    mc('rabbit.speak = rabbit.speak.bind(rabbit) is a way to…',
      ['Copy the prototype.', 'Lock this so you can pass the function around.', 'Remove speak.', 'Make an arrow.'],
      'b', 'bind returns a bound function.',
      cite('this', ELO, 163, 'speak.call(whiteRabbit, "Hurry");'),
      'const speak = rabbit.speak.bind(rabbit)', 2),
    mc('Changing Rabbit.prototype.speak later…',
      ['Does nothing for existing instances.', 'Is seen by instances that inherit that prototype.', 'Rewrites Object.prototype.', 'Requires new.'],
      'b', 'Lookup walks the chain at call time.',
      cite('Prototypes', ELO, 164, 'All rabbits share that same method.'),
      'Rabbit.prototype.speak = function () {\n  return "new";\n}', 3),
    mc('A primitive can still have methods because…',
      ['Numbers are objects.', 'JS boxes them to call methods on a prototype, then discards the box.', 'Methods are macros.', 'You must new Number.'],
      'b', 'Definitive Guide: they can behave like immutable objects.',
      cite('Prototypes', DEF, 148, 'And even though strings, numbers, and booleans are not objects, they can behave like immutable objects.'),
      '"hi".toUpperCase()', 2),
    codeCard('methodCall', 'whiteRabbit.speak("Hurry")', 'Methods', ELO, 163,
      'speak.call(whiteRabbit, "Hurry"); // → The white rabbit says \'Hurry\'', 'JavaScript'),
    codeCard('getProto', 'Object.getPrototypeOf({})', 'Prototypes', ELO, 164,
      'Object.getPrototypeOf returns the prototype of an object.', 'JavaScript'),
    codeCard('arrowThis', 'const speak = () => this.line', 'this', ELO, 163,
      'Arrow functions are different—they do not bind their own this but can see the this of the surrounding scope.', 'JavaScript'),
  ],
};

const jsModules = {
  title: 'JavaScript - Modules',
  notes: `# Modules

Split a program into files with an explicit interface.

## What you should be able to do

- \`export\` names and \`import\` them.
- Know ES modules are strict and have their own scope.
- Prefer named exports for more than one value.

## Assigned reading

- Eloquent JavaScript, 4th Edition - *Modules* / ES modules (PDF p. 266-267).
- JavaScript: The Definitive Guide, 7th Edition - \`import\` and \`export\` (PDF p. 273).

## export

\`\`\`js
export function add(a, b) {
  return a + b;
}
export const VERSION = 1;
\`\`\`

## import

\`\`\`js
import { add } from "./math.js";
\`\`\`

The path is a module specifier. In browsers it usually needs a \`./\` and a file extension.

## default

One default export per module: \`export default function load() {}\` then \`import load from "./load.js"\`. Named exports scale better.

## Coding tasks

Return JavaScript source for export and import.
`,
  reading: [{ book: ELO, page: 266 }, { book: DEF, page: 273 }],
  questions: [
    mc('What problem are modules trying to avoid?',
      ['Slow loops', 'Everything sharing one scope and accidentally coupling', 'Missing this', 'JSON size'],
      'b', 'A module lists what it needs and what it provides.',
      cite('export', ELO, 266, 'A module is a piece of program that specifies which other pieces it relies on and which functionality it provides for other modules to use (its interface).'),
      'export function add(a, b) {\n  return a + b;\n}', 1),
    mc('The original language had no modules. Scripts then…',
      ['Each had a private scope.', 'Ran in the same scope and created global bindings.', 'Required import.', 'Could not call functions.'],
      'b', 'That invited accidental entanglement.',
      cite('import', ELO, 267, 'The original JavaScript language did not have any concept of a module. All scripts ran in the same scope.'),
      'import { add } from "./math.js"', 2),
    mc('import { add } from "./math.js" needs the ./ because…',
      ['ES modules require a relative or URL specifier in the browser.', './ marks a default export.', 'math.js is a package name.', 'import is CommonJS only.'],
      'a', 'Bare "math" would be a package specifier.',
      cite('import', DEF, 273, 'The import and export declarations are used together to make values in one module available in another.'),
      'import { add } from "./math.js"', 2),
    mc('export const VERSION = 1 is a…',
      ['default export', 'named export', 'global', 'dynamic import'],
      'b', 'The importer must use the name VERSION.',
      cite('export', DEF, 273, 'The import and export declarations are used together to make values in one module available in another.'),
      'export const VERSION = 1', 1),
    mc('How many default exports may a module have?',
      ['Unlimited', 'One', 'Two if one is a class', 'Zero; default is illegal'],
      'b', 'default is the unnamed main value.',
      cite('default', ELO, 266, 'They make part of the module available to the outside world.'),
      'export default function load() {\n  return true;\n}', 2),
    mc('import load from "./load.js" matches…',
      ['export function load', 'export default function load', 'export const load', 'module.exports.load'],
      'b', 'Default import pairs with default export.',
      cite('default', DEF, 273, 'The import and export declarations are used together to make values in one module available in another.'),
      'import load from "./load.js"', 2),
    mc('import { add as plus } renames…',
      ['The export in the source file', 'The local binding only', 'The filename', 'default'],
      'b', 'The exporting module still uses add.',
      cite('import', DEF, 273, 'The import and export declarations are used together to make values in one module available in another.'),
      'import { add as plus } from "./math.js"', 2),
    mc('Code inside ES modules is…',
      ['sloppy this', 'automatically strict', 'CommonJS', 'hoisted as var'],
      'b', 'Eloquent: class and module code is strict.',
      cite('import', ELO, 267, 'The original JavaScript language did not have any concept of a module.'),
      'export function add(a, b) {\n  return a + b;\n}', 2),
    mc('import("./math.js") returns…',
      ['the add function', 'a Promise for the module namespace', 'undefined', 'a script tag'],
      'b', 'Dynamic import is async.',
      cite('import', DEF, 273, 'The import and export declarations are used together to make values in one module available in another.'),
      'const math = await import("./math.js")', 3),
    mc('Circular imports can work if…',
      ['You only use the bindings after both modules finish evaluating', 'You use var', 'You avoid export', 'You default-export a number'],
      'a', 'Do not call the other module at the top level.',
      cite('export', ELO, 266, 'Module interfaces have a lot in common with object interfaces.'),
      'import { add } from "./math.js"', 3),
    mc('export { add } from "./math.js" does…',
      ['Nothing', 'Re-exports add without a local binding', 'Copies the file', 'Creates default'],
      'b', 'A barrel module.',
      cite('export', DEF, 273, 'The import and export declarations are used together to make values in one module available in another.'),
      'export { add } from "./math.js"', 3),
    mc('Named imports are live bindings. If math.js later assigns add…',
      ['The importer still sees the old function.', 'The importer sees the new value.', 'It throws.', 'Only default is live.'],
      'b', 'They are not copies.',
      cite('import', ELO, 266, 'A module is a piece of program that specifies which other pieces it relies on and which functionality it provides for other modules to use (its interface).'),
      'import { add } from "./math.js"', 3),
    mc('A module specifier "lodash" without ./ usually means…',
      ['A relative file lodash.js in this folder', 'A package the bundler or Node resolves', 'A built-in browser API', 'An error always'],
      'b', 'Bare specifiers are for Node/bundlers.',
      cite('import', DEF, 273, 'The import and export declarations are used together to make values in one module available in another.'),
      'import _ from "lodash"', 2),
    mc('Why not dump helpers on window?',
      ['window is read-only.', 'Name clashes and hidden coupling, which modules were designed to avoid.', 'window cannot hold functions.', 'Browsers forbid it.'],
      'b', 'The old script model invited that mess.',
      cite('export', ELO, 266, 'Modules are an attempt to avoid these problems.'),
      'window.add = add', 1),
    mc('import type is TypeScript. In plain JS you…',
      ['Still write import type', 'Use import { add } for values', 'Cannot import', 'Use #include'],
      'b', 'JS imports values, not types.',
      cite('import', DEF, 273, 'The import and export declarations are used together to make values in one module available in another.'),
      'import { add } from "./math.js"', 2),
    codeCard('namedExport', 'export function add(a, b) {\n  return a + b;\n}', 'export', ELO, 266,
      'A module is a piece of program that specifies which other pieces it relies on and which functionality it provides for other modules to use (its interface).', 'JavaScript'),
    codeCard('namedImport', 'import { add } from "./math.js"', 'import', DEF, 273,
      'The import and export declarations are used together to make values in one module available in another.', 'JavaScript'),
    codeCard('defaultExport', 'export default function load() {\n  return true;\n}', 'default', ELO, 266,
      'They make part of the module available to the outside world.', 'JavaScript'),
  ],
};

const jsGens = {
  title: 'JavaScript - Iterators and generators',
  notes: `# Iterators and generators

\`for...of\` walks an iterator. \`function*\` can pause with \`yield\`.

## What you should be able to do

- Know \`for...of\` calls \`next()\` until \`done\`.
- Write a \`function*\` that yields values.
- Know the generator starts frozen until the first \`next\`.

## Assigned reading

- Eloquent JavaScript, 4th Edition - generator functions / \`yield\` (PDF p. 302).
- JavaScript: The Definitive Guide, 7th Edition - Iterators and Generators (PDF p. 347).

## Iterators

An iterator is an object with \`next()\` returning \`{ value, done }\`. Arrays, strings, Maps, and Sets are iterable.

## Generators

\`\`\`js
function* powers(n) {
  for (let current = n; ; current *= n) {
    yield current;
  }
}
\`\`\`

Calling \`powers(3)\` does not run the body yet.

## yield

Each \`next\` runs until the next \`yield\`, then pauses. The yielded value is \`value\`.

## Coding tasks

Return JavaScript source for a generator and a yield.
`,
  reading: [{ book: ELO, page: 302 }, { book: DEF, page: 347 }],
  questions: [
    mc('When you call powers(3), the body…',
      ['Runs to completion', 'Stays frozen at the start until next()', 'Throws', 'Returns [3, 9, 27]'],
      'b', 'The call only builds the generator.',
      cite('Generators', ELO, 302, 'Initially, when you call powers, the function is frozen at its start.'),
      'const g = powers(3)', 2),
    mc('Each next() on a generator…',
      ['Restarts the function', 'Runs until the next yield and produces that value', 'Always returns done: true', 'Copies the array'],
      'b', 'yield pauses and supplies value.',
      cite('yield', ELO, 302, 'Every time you call next on the iterator, the function runs until it hits a yield expression, which pauses it.'),
      'console.log(g.next().value)', 2),
    mc('function* is required because…',
      ['yield is a syntax error in a normal function', '* makes it async', 'It enables this', 'It is only for classes'],
      'a', 'The star marks a generator function.',
      cite('Generators', ELO, 302, 'Every time you call next on the iterator, the function runs until it hits a yield expression.'),
      'function* powers(n) {\n  yield n;\n}', 1),
    mc('for (const x of powers(3)) without a break…',
      ['Runs three times', 'Never ends if the generator never returns', 'Calls next once', 'Is a syntax error'],
      'b', 'The Eloquent example never returns.',
      cite('yield', ELO, 302, 'When the function returns (the one in the example never returns) the iterator is done.'),
      'for (const power of powers(3)) {\n  if (power > 20) break;\n}', 3),
    mc('g.next().done is true when…',
      ['The first yield runs', 'The generator function returns', 'You call powers()', 'yield is 0'],
      'b', 'Return (or falling off the end) finishes it.',
      cite('yield', ELO, 302, 'When the function returns the iterator is done.'),
      'g.next()', 2),
    mc('yield* xs forwards…',
      ['A return only', 'Every value from another iterable', 'The first value', 'A Promise'],
      'b', 'Same idea as Python yield from.',
      cite('yield', DEF, 347, 'Chapter 12, Iterators and Generators Explains how the for/of loop works with iterable objects.'),
      'function* wrap(xs) {\n  yield* xs;\n}', 3),
    mc('[...g] on a finite generator…',
      ['Leaves g reusable', 'Consumes g into an array', 'Clones the function', 'Is illegal'],
      'b', 'Spread uses the iterator protocol.',
      cite('Iterators', DEF, 347, 'Chapter 12, Iterators and Generators Explains how the for/of loop works with iterable objects.'),
      'const xs = [...g]', 2),
    mc('A Map is iterable. for (const x of map) yields…',
      ['keys only', '[key, value] pairs', 'values only', 'size'],
      'b', 'Same as map.entries().',
      cite('Iterators', DEF, 347, 'Chapter 12, Iterators and Generators Explains how the for/of loop works with iterable objects.'),
      'for (const [k, v] of map) {\n  use(k, v);\n}', 2),
    mc('for...of vs for...in on an array…',
      ['of yields values; in yields keys as strings', 'they are the same', 'of yields keys', 'in yields values'],
      'a', 'Do not use in for arrays.',
      cite('Iterators', DEF, 347, 'Chapter 12, Iterators and Generators Explains how the for/of loop works with iterable objects.'),
      'for (const item of items) {\n  console.log(item);\n}', 2),
    mc('An object is iterable if it has…',
      ['length', '[Symbol.iterator]()', 'next as a number', 'forEach'],
      'b', 'That method must return an iterator.',
      cite('Iterators', DEF, 347, 'Chapter 12, Iterators and Generators Explains how the for/of loop works with iterable objects.'),
      'obj[Symbol.iterator] = function* () {\n  yield 1;\n}', 3),
    mc('g.next(x) after a yield expr…',
      ['Is ignored', 'Resumes; yield expr becomes x', 'Restarts', 'Throws if x is 0'],
      'b', 'Two-way generators; rare but real.',
      cite('yield', ELO, 302, 'which pauses it and causes the yielded value to become the next value produced by the iterator.'),
      'function* echo() {\n  const x = yield 1;\n  yield x;\n}', 3),
    mc('async function* is for…',
      ['Normal arrays', 'Async iterators you consume with for await...of', 'Promises only', 'JSON'],
      'b', 'Each yield can wait.',
      cite('Generators', DEF, 347, 'Chapter 12, Iterators and Generators Explains how the for/of loop works with iterable objects.'),
      'for await (const row of stream()) {\n  use(row);\n}', 3),
    mc('Why write a generator instead of returning a huge array?',
      ['Generators sort.', 'You can produce values lazily as the consumer asks.', 'Yield is parallel.', 'Arrays cannot grow.'],
      'b', 'Same memory reason as Python generators.',
      cite('Generators', ELO, 302, 'Initially, when you call powers, the function is frozen at its start.'),
      'function* rows() {\n  yield "a";\n  yield "b";\n}', 2),
    mc('The first next() runs from the start to the first yield. The value of that next is…',
      ['undefined always', 'the first yielded value', 'the argument to powers', 'done: true'],
      'b', 'Eloquent prints 3, then 9, then 27.',
      cite('yield', ELO, 302, 'Every time you call next on the iterator, the function runs until it hits a yield expression, which pauses it and causes the yielded value to become the next value produced by the iterator.'),
      'powers(3).next().value', 2),
    mc('return() on a generator…',
      ['Is ignored', 'Finishes the iterator and runs finally in the generator if present', 'Restarts', 'Deletes the function'],
      'b', 'for-of calls return() on a break.',
      cite('Iterators', ELO, 302, 'When the function returns the iterator is done.'),
      'g.return()', 3),
    codeCard('genFn', 'function* powers(n) {\n  yield n;\n}', 'Generators', ELO, 302,
      'Initially, when you call powers, the function is frozen at its start.', 'JavaScript'),
    codeCard('yieldVal', 'yield current', 'yield', ELO, 302,
      'the function runs until it hits a yield expression, which pauses it', 'JavaScript'),
    codeCard('forOfGen', 'for (const power of powers(3)) {\n  if (power > 20) break;\n}', 'Iterators', ELO, 302,
      'Every time you call next on the iterator, the function runs until it hits a yield expression.', 'JavaScript'),
  ],
};

writeDeck('applied-classroom/javascript/language/prototypes-and-this', jsProto.title, jsProto.notes, jsProto.questions, jsProto.reading);
writeDeck('applied-classroom/javascript/language/modules', jsModules.title, jsModules.notes, jsModules.questions, jsModules.reading);
writeDeck('applied-classroom/javascript/language/iterators-and-generators', jsGens.title, jsGens.notes, jsGens.questions, jsGens.reading);

function csRef(section) {
  return cite(section, CS, 0, 'See the matching heading in the C# language notes for this deck.');
}

const csTypes = {
  title: 'C# - Types and variables',
  notes: `# Types and variables

C# is statically typed. The compiler checks names before the program runs.

## Types

\`int\`, \`long\`, \`double\`, \`bool\`, \`string\`, and \`char\` are the everyday built-ins. \`var\` asks the compiler to infer a type from the initializer. It is still a real type.

## Variables

\`\`\`csharp
int count = 0;
string name = "Ada";
var total = 1.5;
\`\`\`

A local must be assigned before you read it. Fields get a default (\`0\`, \`null\`, \`false\`).

## Null

Reference types can be \`null\`. \`string?\` in nullable context means "string or null". Value types need \`int?\` for a missing number.

## Coding tasks

Return C# source for a typed local and a nullable int.
`,
  reading: [{ book: CS, chapter: 'Types and variables' }],
  questions: [
    mc('int count = 0; then count = "hi";',
      ['Works; C# is dynamic.', 'Does not compile; count is int.', 'Becomes null.', 'Becomes 0.'],
      'b', 'The type is fixed at compile time.',
      csRef('Types'), 'int count = 0;\ncount = 1;', 1),
    mc('var total = 1.5; makes total…',
      ['object', 'double', 'int', 'dynamic'],
      'b', 'var is inference, not Variant.',
      csRef('Variables'), 'var total = 1.5;', 1),
    mc('Can you write var x; with no initializer?',
      ['Yes', 'No; the compiler cannot infer a type', 'Yes if x is a field', 'Only in a class'],
      'b', 'Locals with var need an initializer.',
      csRef('Variables'), 'var total = 1.5;', 2),
    mc('string name; as a local, then Console.Write(name)…',
      ['Prints null', 'Does not compile; unassigned local', 'Prints ""', 'Throws'],
      'b', 'Locals must be definitely assigned.',
      csRef('Variables'), 'string name = "Ada";', 2),
    mc('int? score means…',
      ['int or null', 'only 0', 'a pointer', 'dynamic'],
      'a', 'Nullable value type.',
      csRef('Null'), 'int? score = null;', 2),
    mc('string? in a nullable-enabled project means…',
      ['A char array', 'string or null; the compiler warns if you forget to check', 'A span', 'Always empty'],
      'b', 'Nullability is part of the type.',
      csRef('Null'), 'string? name = null;', 2),
    mc('default(int) is…',
      ['null', '0', '-1', 'undefined'],
      'b', 'Value types zero; refs null.',
      csRef('Types'), 'int count = default;', 1),
    mc('const double Tax = 0.08; must be…',
      ['A computed runtime value', 'A compile-time constant', 'static only', 'var'],
      'b', 'No new, no method calls (except a few literals).',
      csRef('Variables'), 'const double Tax = 0.08;', 2),
    mc('readonly on a field means…',
      ['Never set', 'Set in the declaration or constructor only', 'Same as const', 'Thread-local'],
      'b', 'Instance immutable after construction.',
      csRef('Variables'), 'readonly int id;', 3),
    mc('object box = 3; is…',
      ['A compile error', 'Boxing the int onto the heap', 'An alias', 'unsafe'],
      'b', 'Value types boxed when stored as object.',
      csRef('Types'), 'object box = 3;', 3),
    mc('typeof(int) vs 3.GetType()…',
      ['The same always', 'typeof is the compile-time type; GetType is the runtime type', 'typeof is slower', 'GetType is only for classes'],
      'b', 'After boxing they can differ from the static type.',
      csRef('Types'), 'typeof(int)', 3),
    mc('string is a reference type. == on strings…',
      ['Always compares references', 'Compares contents (overloaded)', 'Is illegal', 'Trims first'],
      'b', 'Use SequenceEqual for collections, not for string.' ,
      csRef('Types'), 'string name = "Ada";', 2),
    mc('char c = "A";',
      ['Works', 'Does not compile; "A" is string, \'A\' is char', 'Works in unsafe', 'Becomes int'],
      'b', 'Quotes matter.',
      csRef('Types'), "char c = 'A';", 1),
    mc('dynamic x = 1; x = "hi";',
      ['Does not compile', 'Compiles; checks happen at runtime', 'Becomes object only if cast', 'Needs var'],
      'b', 'dynamic opts out of static checking. Prefer real types.',
      csRef('Types'), 'dynamic x = 1;', 3),
    mc('n!.Value on int? n when n is null…',
      ['Returns 0', 'Throws InvalidOperationException', 'Returns null', 'Does not compile'],
      'b', 'Use n ?? 0 or Try pattern.',
      csRef('Null'), 'int score = n ?? 0;', 2),
    codeCard('intLocal', 'int count = 0;', 'Variables', CS, 0, 'See Types and variables in the C# notes.', 'C#'),
    codeCard('varDouble', 'var total = 1.5;', 'Variables', CS, 0, 'See Types and variables in the C# notes.', 'C#'),
    codeCard('nullableInt', 'int? score = null;', 'Null', CS, 0, 'See Types and variables in the C# notes.', 'C#'),
  ],
};

const csMethods = {
  title: 'C# - Methods',
  notes: `# Methods

Named operations with typed parameters and a return type.

## Methods

\`\`\`csharp
static int Add(int a, int b) {
    return a + b;
}
\`\`\`

Instance methods omit \`static\` and can use \`this\`.

## Parameters

\`ref\` passes a variable to be reassigned. \`out\` is a result the callee must assign. \`in\` is a readonly ref. Prefer returning a value or a tuple before \`out\`.

## Overloads

Same name, different parameter lists. Optional arguments must come last.

## Coding tasks

Return C# source for a method and a call.
`,
  reading: [{ book: CS, chapter: 'Methods' }],
  questions: [
    mc('static int Add(int a, int b) is called as…',
      ['this.Add', 'TypeName.Add(1, 2) or Add(1, 2) in the same type', 'new Add()', 'Add<int>'],
      'b', 'static has no instance.',
      csRef('Methods'), 'static int Add(int a, int b) {\n    return a + b;\n}', 1),
    mc('A missing return on a non-void method…',
      ['Returns default', 'Does not compile', 'Returns null', 'Throws'],
      'b', 'Every path must return.',
      csRef('Methods'), 'return a + b;', 1),
    mc('void Log(string msg) returns…',
      ['null', 'nothing; you cannot use it as a value', '0', 'Task'],
      'b', 'void is not a value.',
      csRef('Methods'), 'void Log(string msg) {\n    Console.WriteLine(msg);\n}', 1),
    mc('this in an instance method is…',
      ['The class', 'The current instance', 'null on structs', 'static'],
      'b', 'Omitted when you write Name = name.',
      csRef('Methods'), 'this.name = name;', 2),
    mc('out int n as a parameter means…',
      ['n is readonly', 'The callee must assign n before return', 'n is optional', 'n is boxed'],
      'b', 'The caller writes Add(a, b, out int sum).',
      csRef('Parameters'), 'Add(1, 2, out int sum);', 2),
    mc('ref int n lets the method…',
      ['Only read n', 'Assign a new value that the caller sees', 'Copy n', 'Pin n in GC'],
      'b', 'The argument must be a variable.',
      csRef('Parameters'), 'Swap(ref a, ref b);', 2),
    mc('Prefer (int q, int r) Divide(...) over out because…',
      ['out is illegal', 'A return value is harder to ignore accidentally and reads as data', 'Tuples are slower so you should not', 'out cannot be named'],
      'b', 'out is for TryParse-style APIs.',
      csRef('Parameters'), 'return (q, r);', 3),
    mc('Optional parameters must…',
      ['Come first', 'Come last and have a compile-time default', 'Be ref', 'Be dynamic'],
      'b', 'void Log(string msg, bool verbose = false)',
      csRef('Overloads'), 'void Log(string msg, bool verbose = false) {\n}', 2),
    mc('Two Add methods, Add(int,int) and Add(double,double), are…',
      ['Invalid', 'Overloads; the compiler picks by argument types', 'Overrides', 'Generics'],
      'b', 'Same name, different signature.',
      csRef('Overloads'), 'static int Add(int a, int b) {\n    return a + b;\n}', 2),
    mc('override vs overload…',
      ['They are the same', 'override replaces a virtual parent method; overload is another signature', 'override is for static only', 'overload needs virtual'],
      'b', 'Different features.',
      csRef('Overloads'), 'public override string ToString() {\n    return Name;\n}', 3),
    mc('Expression-bodied Add => a + b; is…',
      ['A field', 'A compact method body', 'An anonymous type', 'unsafe'],
      'b', 'Same as a one-line return.',
      csRef('Methods'), 'static int Add(int a, int b) => a + b;', 2),
    mc('params int[] xs lets the caller write Add(1, 2, 3). It must be…',
      ['The first parameter', 'The last parameter', 'ref', 'generic'],
      'b', 'A params array at the end.',
      csRef('Parameters'), 'static int Add(params int[] xs) {\n    return xs.Sum();\n}', 3),
    mc('async Task<int> Load() should be returned with…',
      ['return 3; (the 3 is wrapped in a Task)', 'return Task only', 'void', 'out int'],
      'a', 'async wraps the value.',
      csRef('Methods'), 'async Task<int> Load() {\n    return 3;\n}', 3),
    mc('Extension methods look like instance calls but are…',
      ['virtual', 'static methods with this on the first parameter', 'macros', 'LINQ only'],
      'b', 'static int WordCount(this string s)',
      csRef('Methods'), 'static int WordCount(this string s) {\n    return s.Split(\' \').Length;\n}', 3),
    mc('Named arguments Add(b: 2, a: 1) …',
      ['Are illegal', 'Bind by name, so order can change', 'Ignore types', 'Only work with out'],
      'b', 'Useful when many optionals exist.',
      csRef('Overloads'), 'Add(a: 1, b: 2)', 2),
    codeCard('addMethod', 'static int Add(int a, int b) {\n    return a + b;\n}', 'Methods', CS, 0, 'See Methods in the C# notes.', 'C#'),
    codeCard('callAdd', 'int sum = Add(1, 2);', 'Methods', CS, 0, 'See Methods in the C# notes.', 'C#'),
    codeCard('outParse', 'int.TryParse(text, out int n);', 'Parameters', CS, 0, 'See Methods in the C# notes.', 'C#'),
  ],
};

const csDict = {
  title: 'C# - Dictionaries',
  notes: `# Dictionaries

Key/value lookup. This is the C# counterpart of a Python dict or a JavaScript Map.

## Initialize

\`\`\`csharp
var ages = new Dictionary<string, int>();
var known = new Dictionary<string, int> {
    ["Ada"] = 36,
    ["Grace"] = 85
};
\`\`\`

Generic arguments are key type, then value type.

## Lookup

\`\`\`csharp
int n = ages["Ada"];          // KeyNotFoundException if missing
bool ok = ages.TryGetValue("Ada", out int age);
int orZero = ages.GetValueOrDefault("Ada");
\`\`\`

The indexer get throws when the key is absent. Prefer \`TryGetValue\` when the key might be missing.

## Exists

\`\`\`csharp
ages.ContainsKey("Ada");
ages.ContainsValue(36);
\`\`\`

ContainsKey is the membership test for keys. ContainsValue walks values (slower).

## Mutate

\`ages["Ada"] = 37\` adds or replaces. \`Add\` throws if the key exists. \`Remove\` returns whether it was there.

## Coding tasks

Return C# source that creates a dictionary, reads a key, and tests membership.
`,
  reading: [{ book: CS, chapter: 'Dictionaries' }],
  questions: [
    mc('How do you initialize an empty string-to-int dictionary?',
      ['new Map<string, int>()', 'new Dictionary<string, int>()', 'new dict[string, int]', '{} as Dictionary'],
      'b', 'Generic Dictionary, key then value.',
      csRef('Initialize'), 'var ages = new Dictionary<string, int>();', 1),
    mc('Collection initializer ages["Ada"] = 36 inside new Dictionary<string,int> { ... } …',
      ['Is illegal', 'Inserts that pair', 'Only works for lists', 'Needs Add only'],
      'b', 'Indexer initializer syntax.',
      csRef('Initialize'), 'var known = new Dictionary<string, int> {\n    ["Ada"] = 36\n};', 2),
    mc('ages["Ada"] when Ada is missing…',
      ['Returns 0', 'Returns null', 'Throws KeyNotFoundException', 'Inserts 0'],
      'c', 'Indexer get is the strict path.',
      csRef('Lookup'), 'int n = ages["Ada"];', 1),
    mc('How do you get a value if the key might be missing?',
      ['ages.Get("Ada")', 'ages.TryGetValue("Ada", out int age)', 'ages["Ada"] ?? 0', 'ages.has("Ada")'],
      'b', 'TryGetValue is the dictionary equivalent of a safe get.',
      csRef('Lookup'), 'bool ok = ages.TryGetValue("Ada", out int age);', 1),
    mc('GetValueOrDefault("Ada") on a missing key returns…',
      ['null always', 'default(TValue), 0 for int', 'throws', 'false'],
      'b', 'A convenience over TryGetValue.',
      csRef('Lookup'), 'int orZero = ages.GetValueOrDefault("Ada");', 2),
    mc('How do you test that a key exists?',
      ['"Ada" in ages', 'ages.ContainsKey("Ada")', 'ages.Has("Ada")', 'ages.Exists("Ada")'],
      'b', 'ContainsKey is the membership test.',
      csRef('Exists'), 'ages.ContainsKey("Ada")', 1),
    mc('ContainsValue(36) vs ContainsKey("Ada")…',
      ['They are the same speed', 'ContainsValue scans values; ContainsKey hashes the key', 'ContainsValue is O(1) always', 'ContainsKey scans'],
      'b', 'Prefer keys for membership.',
      csRef('Exists'), 'ages.ContainsValue(36);', 2),
    mc('ages["Ada"] = 37 when Ada already exists…',
      ['Throws', 'Replaces the value', 'Adds a second Ada', 'No-ops'],
      'b', 'Indexer set is add-or-replace.',
      csRef('Mutate'), 'ages["Ada"] = 37;', 2),
    mc('ages.Add("Ada", 36) when Ada exists…',
      ['Replaces', 'Throws ArgumentException', 'Returns false', 'Ignores'],
      'b', 'Add is insert-only.',
      csRef('Mutate'), 'ages.Add("Ada", 36);', 2),
    mc('foreach (var pair in ages) gives…',
      ['only keys', 'KeyValuePair<TKey,TValue> with .Key and .Value', 'only values', 'indexes'],
      'b', 'Or deconstruct: foreach (var (k, v) in ages).',
      csRef('Lookup'), 'foreach (var pair in ages) {\n    Console.WriteLine(pair.Key);\n}', 2),
    mc('Dictionary keys must…',
      ['Be strings', 'Provide a hash and equality (default comparers do this for string and int)', 'Be classes', 'Be unique values too'],
      'b', 'Mutable keys that change after insert break lookup.',
      csRef('Initialize'), 'var ages = new Dictionary<string, int>();', 3),
    mc('new Dictionary<string, int>(StringComparer.OrdinalIgnoreCase) means…',
      ['Values are case-insensitive', '"Ada" and "ada" are the same key', 'Keys are interned', 'It sorts'],
      'b', 'The comparer is part of the map.',
      csRef('Initialize'), 'var ages = new Dictionary<string, int>(StringComparer.OrdinalIgnoreCase);', 3),
    mc('Remove("Ada") returns…',
      ['the value', 'bool: whether the key was present', 'void', 'the key'],
      'b', 'Safe to call if missing.',
      csRef('Mutate'), 'ages.Remove("Ada");', 2),
    mc('TryGetValue is preferred over ContainsKey plus indexer because…',
      ['It is two hashes otherwise', 'The indexer is slower at compile time', 'ContainsKey is deprecated', 'out is required by C#'],
      'a', 'One lookup instead of two.',
      csRef('Lookup'), 'if (ages.TryGetValue("Ada", out int age)) {\n    use(age);\n}', 3),
    mc('A Dictionary is not ordered by key. If you need sorted keys…',
      ['Dictionary sorts if you Add in order', 'Use SortedDictionary or sort Keys', 'Use an array', 'Set Comparer to Sorted'],
      'b', 'Dictionary enumerates in an undefined order.',
      csRef('Lookup'), 'foreach (var key in ages.Keys.OrderBy(k => k)) {\n}', 3),
    codeCard('newDict', 'var ages = new Dictionary<string, int>();', 'Initialize', CS, 0, 'See Dictionaries in the C# notes.', 'C#'),
    codeCard('tryGet', 'ages.TryGetValue("Ada", out int age);', 'Lookup', CS, 0, 'See Dictionaries in the C# notes.', 'C#'),
    codeCard('containsKey', 'ages.ContainsKey("Ada")', 'Exists', CS, 0, 'See Dictionaries in the C# notes.', 'C#'),
  ],
};

const csClasses = {
  title: 'C# - Classes',
  notes: `# Classes

Types with fields, properties, and constructors.

## Classes

\`\`\`csharp
class Dog {
    public string Name { get; }
    public int Age { get; private set; }

    public Dog(string name, int age) {
        Name = name;
        Age = age;
    }

    public void Sit() { }
}
\`\`\`

## Properties

\`{ get; set; }\` is an auto-property. Use \`private set\` or \`init\` to restrict writes. Fields stay private.

## Inheritance

\`class SearchDog : Dog\` calls \`base(name, age)\`. \`virtual\` / \`override\` for methods you expect to replace.

## Coding tasks

Return C# source for a class, a property, and a constructor.
`,
  reading: [{ book: CS, chapter: 'Classes' }],
  questions: [
    mc('new Dog("Willie", 6) calls…',
      ['Sit', 'the constructor matching those arguments', 'Dispose', 'the class body as a function'],
      'b', 'Constructors have the type name.',
      csRef('Classes'), 'public Dog(string name, int age) {\n    Name = name;\n}', 1),
    mc('public string Name { get; } is…',
      ['A field', 'A get-only auto-property', 'A method', 'const'],
      'b', 'Set it in the constructor.',
      csRef('Properties'), 'public string Name { get; }', 1),
    mc('private set on Age means…',
      ['Nobody can read Age', 'Only the type can assign Age after init', 'It is readonly forever including constructor', 'It is static'],
      'b', 'The constructor and methods inside Dog can set it.',
      csRef('Properties'), 'public int Age { get; private set; }', 2),
    mc('class SearchDog : Dog means…',
      ['An alias', 'SearchDog inherits Dog', 'A mixin', 'An interface only'],
      'b', 'C# uses a colon for the parent.',
      csRef('Inheritance'), 'class SearchDog : Dog {\n}', 1),
    mc('base(name, age) in a subclass constructor…',
      ['Copies fields by hand', 'Calls the parent constructor', 'Is optional always', 'Boxes the parent'],
      'b', 'Must be first if the parent has no empty constructor.',
      csRef('Inheritance'), 'public SearchDog(string name, int age) : base(name, age) {\n}', 2),
    mc('virtual Sit() plus override Sit() …',
      ['Hides without polymorphism', 'Lets a Dog variable call SearchDog.Sit', 'Is an overload', 'Needs static'],
      'b', 'The runtime type picks the method.',
      csRef('Inheritance'), 'public override void Sit() {\n}', 2),
    mc('new on a method (not override) …',
      ['Is override', 'Hides the parent method; a Dog variable still calls Dog.Sit', 'Is required', 'Implements an interface'],
      'b', 'Prefer override when you meant polymorphism.',
      csRef('Inheritance'), 'public new void Sit() {\n}', 3),
    mc('A class can inherit how many classes?',
      ['Unlimited', 'One class, plus any number of interfaces', 'Two', 'None; only structs'],
      'b', 'Single inheritance.',
      csRef('Inheritance'), 'class SearchDog : Dog, IDisposable {\n}', 2),
    mc('record Dog(string Name, int Age) is…',
      ['A Java record only', 'A reference type with value-like equality and a primary constructor', 'A struct always', 'unsafe'],
      'b', 'Shorthand for an immutable data class.',
      csRef('Classes'), 'record Dog(string Name, int Age);', 3),
    mc('struct vs class for Dog…',
      ['They are the same', 'struct is a value type (copied); class is a reference', 'struct cannot have methods', 'class cannot have fields'],
      'b', 'Default to class unless you need a small value.',
      csRef('Classes'), 'class Dog {\n    public string Name { get; }\n}', 2),
    mc('this() in a constructor…',
      ['Calls another constructor on the same type', 'Calls the parent', 'Allocates this', 'Is Dispose'],
      'a', 'Constructor chaining.',
      csRef('Classes'), 'public Dog() : this("Ada", 1) {\n}', 3),
    mc('~Dog() is…',
      ['A constructor', 'A finalizer; prefer IDisposable for cleanup', 'Required', 'async'],
      'b', 'Do not put normal cleanup there.',
      csRef('Classes'), 'public void Dispose() {\n}', 3),
    mc('internal means…',
      ['Only this file', 'Only this assembly', 'Public', 'Private to the method'],
      'b', 'The default for types with no modifier in a typical project.',
      csRef('Classes'), 'internal class Dog {\n}', 2),
    mc('An auto-property { get; init; } can be set…',
      ['Anytime', 'In the constructor or an object initializer', 'Only via reflection', 'Never'],
      'b', 'init-only for immutable objects.',
      csRef('Properties'), 'public string Name { get; init; }', 2),
    mc('new Dog { Name = "Willie" } requires…',
      ['A set or init accessor on Name', 'Name to be a field', 'params', 'unsafe'],
      'a', 'Object initializers call setters/init.',
      csRef('Properties'), 'var d = new Dog { Name = "Willie" };', 2),
    codeCard('dogClass', 'class Dog {\n    public string Name { get; }\n}', 'Classes', CS, 0, 'See Classes in the C# notes.', 'C#'),
    codeCard('dogCtor', 'public Dog(string name) {\n    Name = name;\n}', 'Classes', CS, 0, 'See Classes in the C# notes.', 'C#'),
    codeCard('inherit', 'class SearchDog : Dog {\n}', 'Inheritance', CS, 0, 'See Classes in the C# notes.', 'C#'),
  ],
};

const csLinq = {
  title: 'C# - LINQ',
  notes: `# LINQ

Query operators over sequences. Deeper than a \`for\` loop when you are filtering and projecting.

## Where and Select

\`\`\`csharp
var names = people
    .Where(p => p.Age >= 18)
    .Select(p => p.Name)
    .ToList();
\`\`\`

\`Where\` filters. \`Select\` maps. Execution is deferred until you enumerate or call \`ToList\`.

## Deferred execution

Building the query does not walk the source. Changing the source before \`ToList()\` changes the result. Call \`ToList\` when you need a snapshot.

## Aggregates

\`Any\`, \`All\`, \`First\`, \`FirstOrDefault\`, \`Count\`, \`Sum\`. \`First\` throws if empty; \`FirstOrDefault\` returns default.

## Coding tasks

Return C# LINQ that filters and projects.
`,
  reading: [{ book: CS, chapter: 'LINQ' }],
  questions: [
    mc('people.Where(p => p.Age >= 18) returns…',
      ['a List immediately', 'a deferred query; nothing walks yet', 'an array', 'only the first'],
      'b', 'LINQ to Objects is lazy.',
      csRef('Deferred execution'), 'var q = people.Where(p => p.Age >= 18);', 2),
    mc('Select(p => p.Name) is…',
      ['A filter', 'A projection / map', 'A join', 'A sort'],
      'b', 'One output per input (unless you SelectMany).',
      csRef('Where and Select'), 'var names = people.Select(p => p.Name);', 1),
    mc('ToList() is needed when…',
      ['You want to run the query and hold the results', 'Select is used', 'the source is a List already always', 'Where is used'],
      'a', 'Materialize.',
      csRef('Deferred execution'), 'var names = people.Where(p => p.Age >= 18).ToList();', 2),
    mc('First() on an empty sequence…',
      ['Returns null', 'Throws InvalidOperationException', 'Returns 0', 'Waits'],
      'b', 'Use FirstOrDefault when empty is normal.',
      csRef('Aggregates'), 'var first = people.First();', 2),
    mc('FirstOrDefault() on empty List<int> returns…',
      ['null', '0', 'throws', '-1'],
      'b', 'default(int).',
      csRef('Aggregates'), 'var n = nums.FirstOrDefault();', 2),
    mc('Any(p => p.Age < 0) is better than Count(...) > 0 because…',
      ['Any is deprecated', 'Any can stop at the first match', 'Count is illegal on IEnumerable', 'Any allocates a list'],
      'b', 'Short-circuit.',
      csRef('Aggregates'), 'bool bad = people.Any(p => p.Age < 0);', 2),
    mc('OrderBy(p => p.Name).ThenBy(p => p.Age) …',
      ['ThenBy replaces OrderBy', 'ThenBy is a secondary sort', 'Is a filter', 'Needs ToList first always'],
      'b', 'Stable multi-key sort.',
      csRef('Where and Select'), 'people.OrderBy(p => p.Name).ThenBy(p => p.Age)', 3),
    mc('GroupBy(p => p.City) yields…',
      ['a Dictionary always', 'groups with a Key and items', 'only keys', 'only the first city'],
      'b', 'IGrouping<TKey,T>. ToDictionary if you need a map.',
      csRef('Where and Select'), 'foreach (var g in people.GroupBy(p => p.City)) {\n}', 3),
    mc('SelectMany(p => p.Tags) …',
      ['Nests lists', 'Flattens each person\'s tags into one sequence', 'Filters tags', 'Joins SQL only'],
      'b', 'Map then flatten.',
      csRef('Where and Select'), 'var tags = people.SelectMany(p => p.Tags);', 3),
    mc('people.Where(...).Where(...) …',
      ['Is illegal', 'Ands the predicates; still deferred', 'Runs twice now', 'Needs Concat'],
      'b', 'Compose queries.',
      csRef('Deferred execution'), 'var q = people.Where(p => p.Age >= 18).Where(p => p.City == "X");', 2),
    mc('If you mutate people after creating q but before ToList…',
      ['q is frozen', 'ToList sees the new contents', 'It throws', 'LINQ copies on Where'],
      'b', 'Deferred: the source is read later.',
      csRef('Deferred execution'), 'var q = people.Where(p => p.Age >= 18);\npeople.Add(new Person());', 3),
    mc('IQueryable vs IEnumerable LINQ…',
      ['They are the same', 'IQueryable can translate to SQL; IEnumerable runs in process', 'IEnumerable is only arrays', 'IQueryable cannot Where'],
      'b', 'EF Core uses IQueryable.',
      csRef('Where and Select'), 'var q = db.People.Where(p => p.Age >= 18);', 3),
    mc('Count() without a predicate vs .Count on List…',
      ['Always the same speed', 'Count() on IEnumerable<T> that is a List uses the Count property; still prefer .Count on a known list', 'Count() never uses Count', 'They throw'],
      'b', 'Know what you have.',
      csRef('Aggregates'), 'int n = people.Count();', 3),
    mc('The query syntax from p in people where p.Age >= 18 select p.Name is…',
      ['SQL sent to the server always', 'C# that compiles to the same Where/Select calls', 'A string', 'F#'],
      'b', 'Two syntaxes, one API.',
      csRef('Where and Select'), 'var names = from p in people\n    where p.Age >= 18\n    select p.Name;', 2),
    mc('Single() vs First()…',
      ['They are equal', 'Single throws if there is not exactly one match', 'Single is faster', 'First throws if there are two'],
      'b', 'Single is a uniqueness check.',
      csRef('Aggregates'), 'var ada = people.Single(p => p.Name == "Ada");', 2),
    codeCard('whereSelect', 'var names = people.Where(p => p.Age >= 18).Select(p => p.Name).ToList();', 'Where and Select', CS, 0, 'See LINQ in the C# notes.', 'C#'),
    codeCard('anyBad', 'bool bad = people.Any(p => p.Age < 0);', 'Aggregates', CS, 0, 'See LINQ in the C# notes.', 'C#'),
    codeCard('firstOrDefault', 'var n = nums.FirstOrDefault();', 'Aggregates', CS, 0, 'See LINQ in the C# notes.', 'C#'),
  ],
};

writeDeck('applied-classroom/csharp/language/types-and-variables', csTypes.title, csTypes.notes, csTypes.questions, csTypes.reading);
writeDeck('applied-classroom/csharp/language/methods', csMethods.title, csMethods.notes, csMethods.questions, csMethods.reading);
writeDeck('applied-classroom/csharp/language/dictionaries', csDict.title, csDict.notes, csDict.questions, csDict.reading);
writeDeck('applied-classroom/csharp/language/classes', csClasses.title, csClasses.notes, csClasses.questions, csClasses.reading);
writeDeck('applied-classroom/csharp/language/linq', csLinq.title, csLinq.notes, csLinq.questions, csLinq.reading);
