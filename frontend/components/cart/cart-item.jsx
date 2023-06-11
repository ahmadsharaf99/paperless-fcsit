const cartItem = (props) => {
  return (
    <tr>
      <td>{props.sn}</td>
      <td>
        {props.item.name.length > 15
          ? String(props.item.name).substring(0, 15) + '...'
          : props.item.name}
      </td>
      <td>&#8358;{Number(props.item.price).toLocaleString()}</td>
      {/* <td>{props.item.discount}</td> */}
      <td className="">
        {/* <i
          className="bx bx-minus cursor-pointer btn btn-warning"
          style={{ cursor: 'pointer' }}
        ></i> */}
        <input
          type="number"
          className="p-0 mx-2 form-control border-success border-2 text-center"
          style={{ width: '40px' }}
          value={props.item.quantity}
          onChange={props.changed}
        />
        {/* <i
          className="bx bx-plus cursor-pointer btn btn-secondary"
          style={{ cursor: 'pointer' }}
        ></i> */}
      </td>
      <td>{Number(props.item.total).toLocaleString()}</td>
      <td>
        <i class="bx bxs-trash btn btn-danger" onClick={props.clicked}></i>
      </td>
    </tr>
  );
};

export default cartItem;
