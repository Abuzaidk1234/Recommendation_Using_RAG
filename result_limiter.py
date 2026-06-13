from shared_functions import *

def main():
    print(" RESULT LIMITER")
    print("=" * 30)
    
    # Load food data
    food_items = load_food_data('./FoodDataSet.json')
    
    # Create and populate search collection
    collection = create_similarity_search_collection(
        "result_limiter_collection",
        {'description': 'A collection for testing result limits'}
    )
    populate_similarity_collection(collection, food_items)
    
    while True:
        try:
            query = input("\nEnter search query (or 'quit' to exit): ").strip()
            if query.lower() in ['quit', 'exit', 'q']:
                break
            if not query:
                continue
                
            limit_input = input("Enter number of results to fetch (e.g., 1, 3, 5, 10): ").strip()
            if not limit_input.isdigit():
                print(" Please enter a valid number.")
                continue
                
            n_results = int(limit_input)
            
            print(f"\n Searching for '{query}' (limit: {n_results})...")
            results = perform_similarity_search(collection, query, n_results=n_results)
            
            if not results:
                print(" No matching foods found.")
            else:
                print(f"\n Found {len(results)} recommendations:")
                print("-" * 40)
                for i, result in enumerate(results, 1):
                    print(f"{i}. ️  {result['food_name']} ({result['similarity_score']*100:.1f}% match)")
                print("-" * 40)
                
        except KeyboardInterrupt:
            print("\n Goodbye!")
            break
        except Exception as e:
            print(f" Error: {e}")

if __name__ == "__main__":
    main()