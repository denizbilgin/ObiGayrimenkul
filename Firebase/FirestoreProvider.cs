﻿using Google.Cloud.Firestore;
using System.Collections;

namespace ObiGayrimenkul.Firebase
{
    public class FirestoreProvider
    {
        public readonly FirestoreDb _fireStoreDb = null!;

        public FirestoreProvider(FirestoreDb fireStoreDb)
        {
            _fireStoreDb = fireStoreDb;
        }

        public async Task Add<T>(T entity, String CollectionName, CancellationToken ct) where T : IFirebaseEntity
        {
            var collection = _fireStoreDb.Collection(CollectionName);
            var addedDoc = await collection.AddAsync(entity, ct);
            entity.Id = addedDoc.Id;
        }

        
        public async Task Update<T>(T entity , string CollectionName , CancellationToken ct) where T : IFirebaseEntity
        {
            var collection = _fireStoreDb.Collection(CollectionName);
            var document = collection.Document(entity.Id);
            try
            {
                await document.SetAsync(entity, SetOptions.Overwrite, ct);
            }catch(Exception e)
            {
                Console.WriteLine($"Update Hata : {e.Message}");
            }


        }

        public async Task AddOrUpdate<T>(T entity, string CollectionName , CancellationToken ct) where T : IFirebaseEntity
        {
            var collection = _fireStoreDb.Collection(CollectionName);

            if (string.IsNullOrEmpty(entity.Id))
            {
                var addedDoc = await collection.AddAsync(entity, ct);
                entity.Id = addedDoc.Id;
            }
            else
            {
                var document = collection.Document(entity.Id);
                await document.SetAsync(entity, SetOptions.Overwrite, ct);
            }
        }


        public async Task<T> Get<T>(string id,string CollectionName, CancellationToken ct) where T : IFirebaseEntity
        {
            var document = _fireStoreDb.Collection(CollectionName).Document(id);
            var snapshot = await document.GetSnapshotAsync(ct);
            return snapshot.ConvertTo<T>();
        }

        public async Task<IReadOnlyCollection<T>> GetAll<T>(String CollectionName, CancellationToken ct) where T : IFirebaseEntity
        {
            var collection = _fireStoreDb.Collection(CollectionName); ;
            var snapshot = await collection.GetSnapshotAsync(ct);
            return snapshot.Documents.Select(x => x.ConvertTo<T>()).ToList();
        }

        public async Task<IReadOnlyCollection<T>> GetAllApproved<T>(CancellationToken ct) where T : IFirebaseEntity
        {
            var collection = _fireStoreDb.Collection("adverts");
            var query = collection.WhereEqualTo("approved", true);
            var snapshot = await query.GetSnapshotAsync(ct);
            return snapshot.Documents.Select(x => x.ConvertTo<T>()).ToList();
        }


        /*public async Task<IReadOnlyCollection<T>> GetAllUsers<T>(CancellationToken ct) where T : IFirebaseEntity
        {
            var collection = _fireStoreDb.Collection("users"); ;
            var snapshot = await collection.GetSnapshotAsync(ct);
            return snapshot.Documents.Select(x => x.ConvertTo<T>()).ToList();
        }*/

        public async Task<IReadOnlyCollection<T>> WhereEqualTo<T>(string fieldPath, object value, CancellationToken ct) where T : IFirebaseEntity
        {
            return await GetList<T>(_fireStoreDb.Collection(typeof(T).Name).WhereEqualTo(fieldPath, value), ct);
        }


       /* private static async Task<IReadOnlyCollection<T>> GetList<T>(Query query, CancellationToken ct) where T : IFirebaseEntity
        {
            var snapshot = await query.GetSnapshotAsync(ct);
            return snapshot.Documents.Select(x => x.ConvertTo<T>()).ToList();
        }*/

        public async Task<IReadOnlyCollection<T>> GetList<T>(Query query, CancellationToken ct) where T : IFirebaseEntity
        {
            var snapshot = await query.GetSnapshotAsync(ct);
            var list = new List<T>();

            foreach (var document in snapshot.Documents)
            {
                var entity = document.ConvertTo<T>();
                list.Add(entity);
            }

            return list.AsReadOnly();
        }
        public async Task Delete(string id, string CollectionName, CancellationToken ct)
        {
            var document = _fireStoreDb.Collection(CollectionName).Document(id);
            await document.DeleteAsync(cancellationToken: ct);
        }

        public async Task MoveDocument<T>(string id, string sourceCollection, string destinationCollection, CancellationToken ct) where T : IFirebaseEntity
        {
            try
            {
                var sourceDocument = _fireStoreDb.Collection(sourceCollection).Document(id);
                var snapshot = await sourceDocument.GetSnapshotAsync(ct);

                if (!snapshot.Exists)
                {
                    Console.WriteLine("Document hasnot found in collection.");
                    return;
                }

                var entity = snapshot.ConvertTo<T>();
                entity.Id = id;

                var destinationCollectionRef = _fireStoreDb.Collection(destinationCollection);
                var destinationDocument = destinationCollectionRef.Document(id);
                await destinationDocument.SetAsync(entity, SetOptions.Overwrite, ct);

                await sourceDocument.DeleteAsync(cancellationToken: ct);
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error moving document: {ex.Message}");
            }
        }


    }

}
