export default function createItemsArray(
  candyBag,
  name,
  identifier,
  note,
  note2,
  note3
) {
  const items = candyBag.map((item) => {
    if (["pack in bag", "pack in bowl"].includes(item.title)) {
      return {
        quantity: item.count,
        id: item.id,
        properties: {
          _bag_type: "pick_and_mix",
          Name: `${name}`,
          ID: `${identifier}`,
          Amount: `${item.amount}`,
          name: "Pak",
          value: true,
        },
      };
    }
    const lineItem = {
      quantity: item.count,
      id: item.id,
      properties: {
        _bag_type: note3 ? "gift" : "pick_and_mix",
        Name: `${name}`,
        ID: `${identifier}`,
        Amount: `${item.amount}`,
        _is_gift: note3,
        _Note: note,
        _Gift_LineItems: note2,
      },
    };
    return lineItem;
  });
  return items;
}
