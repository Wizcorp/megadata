# ![Megadata](./images/logo.png)

Megadata is a library you can use to serialize/deserialize network game
data.

This library will help you deal with:

  1. Defining type IDs and type classes
  2. Definining the serialization/deserialization format to use
  3. Re-using messages object, by creating and maintaining a message pool
  4. Sharing message libraries between client (JavaScript) and server (Node.js)
  5. TypeScript type checks

## Installation

```shell
npm install --save megadata
```

You will also need to make sure that the following configuration is set in your tsconfig.json:

```json
{
  "compilerOptions": {
    "experimentalDecorators": true
  }
}
```

## Usage

### Defining message types

> shared/messages/index.ts

```typescript
import megadata, { TypeDecorator } from 'megadata'

export const enum TypeIds {
  Join,
  Leave
}

export const Type: TypeDecorator<TypeIds> = megadata(module)
```

We first create a list of message types as a `const enum` and
list the messages we will send and receive in our game. We then
generate a `@Type` decorator

> shared/messages/types/Join.ts

```typescript
import { Type, TypeIds } from '../'
import MessageType from 'megadata/classes/MessageType'
import Binary, { Uint32 } from 'megadata/classes/BinarySerializationFormat'

@Type(TypeIds.Join, Binary)
export default class Join extends MessageType {
  @Uint32
  public time: number
}
```

> shared/messages/types/Leave.ts

```typescript
import { Type, TypeIds } from '../'
import MessageType from 'megadata/classes/MessageType'
import Json from 'megadata/classes/JsonSerializationFormat'

@Type(TypeIds.Leave, Json)
export default class Leave extends MessageType {
  public time: number
}
```


Next, we define what our `Join` and `Leave` messages type will look like, and
how we should serialize and deserialize it.

Megadata ships with two serialization formats:

  1. **binary**: deals only with messages containing numbers, but is blazing fast
  2. **json**: deals with any kind of data, but is slower

You may notice that the `Binary` serialization format requires additional annotations
this is required to define (and optimized) the size and speed of serialization and
deserialization.

### Sending and receiving messages

> server/classes/Player.ts

```typescript
import Connection from '...'
import MessageEmitter from 'megadata/classes/MessageType'
import MessageType, { IMessageType, MessageTypeData } from 'megadata/classes/MessageType'

export class Player extends MessageEmitter {
  constructor(private connection: Connection) {
    connection.on('message', async (buffer: ArrayBuffer) => {
      const message = MessageType.parse(buffer)
      await this.emitAsync(message)
      message.release()
    })
  }

  public async function send<T extends MessageType>(type: IMessageType<T>, data: MessageTypeData<T>) {
    const message = type.create<T>(data)
    const buffer = message.pack()
    await this.connection.write(buffer)
    message.release()
  }
}
```

Messages are recycled from an object pool to reduce the impact of garbage collection; therefore,
it is important to remember to release messages back into the object pool once you are done with them.

> server/classes/Game.ts

```typescript
import Player from './Player'

import Join from 'shared/messages/types/Join.ts'

export default class Game {
  // ...

  public addPlayer(player: Player) {
    player.on(Join, ({ time }) => console.log('Join time:', time))
    player.on(Leave, ({ time }) => console.log('Leave time:', time))
  }
}
```

### Custom serialization

> shared/messages/classes/CustomSerializationFormat.ts

```typescript
import MessageType from './MessageType'
import SerializationFormat, { ISerializerFunctions } from './SerializationFormat'

export default class CustomSerializationFormat extends SerializationFormat {
  public create<I, T extends MessageType>(id: I, size: number, attributes: any) {
    return {
      create: (...),
      pack: (...),
      unpack: (...),
    } as ISerializerFunctions<I, T>
  }
}
```

You can create your own custom serialization format. Above is a quick stub, but
you should have a look at the [default serialization formats](./classes) provided
by megadata.

> shared/messages/index.ts

```typescript
import Custom from 'shared/messages/classes/CustomSerializationFormat'

// ...

// Change the default serialization format
export const Type: TypeDecorator<TypeIds> = megadata(module, Custom)
```

By default, all data will be serialized using the JSON serialization format. You can
change this default at initialization to the value you prefer.

When using the default format, simply use `@Type(TypeIds.Leave)` (without the format)
when defining your type class.

## Acknowledgements

To @ronkorving for providing the initial implementation of this module.

Nintendo graphic by <a href="http://www.flaticon.com/authors/roundicons-freebies">roundicons_freebies</a> from <a href="http://www.flaticon.com/">Flaticon</a> is licensed under <a href="http://creativecommons.org/licenses/by/3.0/" title="Creative Commons BY 3.0">CC BY 3.0</a>. Check out the new logo that I created on <a href="http://logomakr.com" title="Logo Makr">LogoMakr.com</a> https://logomakr.com/9S4Qsk

## License

MIT License. Copyright (c) Wizcorp Inc.
