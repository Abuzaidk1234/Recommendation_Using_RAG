from shared_functions import *

def main():
    print(" FOOD CALORIE CHECKER")
    print("=" * 30)
    
    # Load food data
    food_items = load_food_data('./FoodDataSet.json')
    
    # Create and populate search collection
    collection = create_similarity_search_collection(
        "calorie_checker_collection",
        {'description': 'A collection for checking food calories'}
    )
    populate_similarity_collection(collection, food_items)
    
    while True:
        try:
            budget_input = input("\nEnter your maximum calorie budget (or 'quit' to exit): ").strip()
            if budget_input.lower() in ['quit', 'exit', 'q']:
                break
                
            if not budget_input.isdigit():
                print(" Please enter a valid number.")
                continue
                
            max_calories = int(budget_input)
            
            while True:
                query = input(f"\nSearch for food under {max_calories} calories (or 'back' to change budget): ").strip()
                if query.lower() in ['back', 'b']:
                    break
                if query.lower() in ['quit', 'exit', 'q']:
                    return
                if not query:
                    continue
                    
                print(f"\n Searching for '{query}' under {max_calories} calories...")
                results = perform_filtered_similarity_search(collection, query, max_calories=max_calories, n_results=5)
                
                if not results:
                    print(" No matching foods found within that calorie budget.")
                else:
                    print(f"\n Found {len(results)} recommendations:")
                    print("-" * 40)
                    for i, result in enumerate(results, 1):
                        print(f"{i}. ️  {result['food_name']} ({result['food_calories_per_serving']} calories)")
                        print(f"    {result['food_description']}")
                        print("-" * 40)
                        
        except KeyboardInterrupt:
            print("\n Goodbye!")
            break
        except Exception as e:
            print(f" Error: {e}")

if __name__ == "__main__":
    main()