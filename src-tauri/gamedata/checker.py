
import json

def main():

    items = []
    with open("items.json") as f:
        items = json.load(f)

    with open("quests.json") as f:
        items.extend(json.load(f))

    get_global_id = lambda x: int(x["global_id"])
    global_ids = list(map(get_global_id, items))

    if len(global_ids) != len(set(global_ids)):
        print("Duplicate global_id found!")
    else:
        print("No duplicate global_id found!")

main()