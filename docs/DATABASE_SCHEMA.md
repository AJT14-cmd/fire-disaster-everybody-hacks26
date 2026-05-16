# PostgreSQL Schema (Proposed)

## `users`

```json
{
  "email": "user@example.com",
  "displayName": "Alex",
  "roles": ["user"],
  "emergencyContacts": [
    { "name": "Sam", "phone": "+15555550123", "relationship": "Spouse" }
  ],
  "evacuationPreferences": {
    "preferredShelterTypes": ["school", "community-center"],
    "medicalNeeds": ["wheelchair_access"]
  },
  "homeLocationEncrypted": "<ciphertext>",
  "createdAt": "timestamp",
  "updatedAt": "timestamp"
}
```

## `alerts`

```json
{
  "userId": "uuid",
  "severity": "critical",
  "message": "Evacuate now. Fire front shifted east.",
  "channels": ["sms", "push"],
  "status": "sent",
  "metadata": { "incidentId": "inc_001" },
  "createdAt": "timestamp"
}
```

## `fire_snapshots`

```json
{
  "regionKey": "34.1,-118.2,25km",
  "firmsActiveFires": [],
  "weather": {},
  "smokeProxy": {},
  "riskMapTiles": [],
  "generatedAt": "timestamp"
}
```

## `community_reports`

```json
{
  "userId": "uuid",
  "lat": 34.12,
  "lng": -118.3,
  "type": "smoke",
  "description": "Heavy smoke near canyon trail.",
  "imageUrl": null,
  "verificationStatus": "pending",
  "createdAt": "timestamp"
}
```

## `shelters`

```json
{
  "name": "Valley Community Shelter",
  "lat": 34.09,
  "lng": -118.21,
  "capacity": 350,
  "currentOccupancy": 164,
  "petFriendly": true,
  "medicalSupport": true,
  "updatedAt": "timestamp"
}
```

## `route_history` (optional future table)

```json
{
  "userId": "uuid",
  "origin": { "lat": 34.1, "lng": -118.2 },
  "destination": { "lat": 34.0, "lng": -118.0 },
  "etaMinutes": 27,
  "distanceKm": 19.4,
  "riskPenalty": 0.31,
  "createdAt": "timestamp"
}
```
