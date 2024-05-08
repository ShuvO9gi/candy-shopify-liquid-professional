export default function createItemsArray(
  candyBag,
  name,
  identifier,
  note,
  note2,
  note3
) {
  const items = candyBag.map((item) => {
    console.log("test");
    console.log({ item });
    const lineItem = {
      quantity: item.count,
      id: item.id,
      properties: {
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
