# 🧠 Solana AI Agent on Nosana

This is an AI agent built for the Nosana Agent Challenge, deployed on the [@nosana_ai](https://nosana.ai) decentralized GPU network. It lets users interact with the **Solana blockchain** using simple commands.

## 🚀 Features

This agent can:
1. ✅ Save a Solana public key with a name (e.g., "alice")
2. 💰 Check wallet balance using a name or public key
3. 🔁 Send SOL to any saved name or directly to a public key

It uses **Redis** for storing names and public keys and connects to Solana **Devnet** for testing.

## 🧰 Available Tools

### 1. `save-user-public-key`
Save a Solana public key with a custom name. 🔐 Prevents duplicate names or keys.

```json
{
  "name": "alice",
  "publicKey": "<SOL address>"
}
```

### 2. `check-balance-by-name`
Check the SOL balance using a name. It looks up the associated public key from Redis.

```json
// Input
{
  "name": "alice"
}

// Output
{
  "balance": 0.5,
  "publicKey": "<resolved address>"
}
```

### 3. `check-balance-by-public-key`
Check the balance directly using a public key.

```json
// Input
{
  "publicKey": "<SOL address>"
}

// Output
{
  "balance": 1.23
}
```

### 4. `send-sol-to-name`
Send SOL to a saved name. Resolves the public key, then sends the amount.

```json
{
  "name": "bob",
  "amount": 0.1
}
```

### 5. `send-sol-to-public-key`
Send SOL directly to a given public key.

```json
{
  "to": "<SOL address>",
  "amount": 0.1
}
```

### 6. `resolve-public-key`
If you pass a name, it returns the public key. If you pass a valid public key, it returns it as-is.

```json
// Input
{
  "nameOrKey": "alice"
}

// Output
{
  "publicKey": "<resolved key>"
}
```

### 7. `check-name-exists`
Check if a name is saved in Redis, and get the public key if it exists.

```json
// Input
{
  "name": "alice"
}

// Output
{
  "exists": true,
  "publicKey": "<SOL address>"
}
```

### 8. `get-all-saved-public-keys`
Returns all saved name → public key mappings.

```json
// Output
{
  "namedKeys": {
    "alice": "<address1>",
    "bob": "<address2>"
  }
}
```

### 9. `check-my-balance`
Check the SOL balance of the agent's own wallet (hardcoded).

```json
// Output
{
  "balance": 2.45
}
```


