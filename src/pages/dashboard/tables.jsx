import {
  Card,
  CardHeader,
  CardBody,
  Typography,
  Avatar,
  Chip,
  Tooltip,
  Progress,
  Button,
  Dialog,
  DialogHeader,
  DialogBody,
  DialogFooter,
} from "@material-tailwind/react";
import { EllipsisVerticalIcon, ClockIcon } from "@heroicons/react/24/outline";
import { authorsTableData, projectsTableData } from "@/data";
import { StatisticsChart } from "@/widgets/charts";
import { statisticsChartsData } from "@/data";
import React from "react";

export function Tables() {
  const [open, setOpen] = React.useState(false);

  const handleOpen = () => setOpen(!open);
  return (
    <div className="mt-12 mb-8 flex flex-col gap-12">
      <Dialog open={open} handler={handleOpen}>
        <DialogHeader>Estadisticas de viajes</DialogHeader>
        <DialogBody>
          <div className="container mx-auto">
            <div className="grid grid-cols-1 gap-4">
              {statisticsChartsData.map((props) => (
                <StatisticsChart
                  key={props.title}
                  {...props}
                  footer={
                    <Typography
                      variant="small"
                      className="flex items-center font-normal text-blue-gray-600"
                    >
                      <ClockIcon
                        strokeWidth={2}
                        className="h-4 w-4 text-blue-gray-400"
                      />
                      &nbsp;{props.footer}
                    </Typography>
                  }
                />
              ))}
            </div>
          </div>
        </DialogBody>
        <DialogFooter>
          <Button
            variant="text"
            color="red"
            onClick={handleOpen}
            className="mr-1"
          >
            <span>Cerrar</span>
          </Button>
        </DialogFooter>
      </Dialog>
      <h3 className="text-2xl font-bold ">Conductores registrados</h3>
      <Card>
        {/* <CardHeader variant="gradient" color="gray" className="mb-8 p-6"> */}
        {/*   <Typography variant="h6" color="white"> */}
        {/*     Authors Table */}
        {/*   </Typography> */}
        {/* </CardHeader> */}
        <CardBody className="overflow-x-scroll px-0 pt-0 pb-2">
          <table className="w-full min-w-[640px] table-auto">
            <thead>
              <tr>
                {["Nombre", "Automovil", "status", "Ultimo viaje", ""].map(
                  (el) => (
                    <th
                      key={el}
                      className="border-b border-blue-gray-50 py-3 px-5 text-left"
                    >
                      <Typography
                        variant="small"
                        className="text-[11px] font-bold uppercase text-blue-gray-400"
                      >
                        {el}
                      </Typography>
                    </th>
                  )
                )}
              </tr>
            </thead>
            <tbody>
              {authorsTableData.map(
                ({ img, name, email, vehicle, online, date }, key) => {
                  const className = `py-3 px-5 ${
                    key === authorsTableData.length - 1
                      ? ""
                      : "border-b border-blue-gray-50"
                  }`;

                  return (
                    <tr key={name}>
                      <td className={className}>
                        <div className="flex items-center gap-4">
                          <Avatar
                            src={img}
                            alt={name}
                            size="sm"
                            variant="rounded"
                          />
                          <div>
                            <Typography
                              variant="small"
                              color="blue-gray"
                              className="font-semibold"
                            >
                              {name}
                            </Typography>
                            <Typography className="text-xs font-normal text-blue-gray-500">
                              {email}
                            </Typography>
                          </div>
                        </div>
                      </td>
                      <td className={className}>
                        <Typography className="text-xs font-semibold text-blue-gray-600">
                          {vehicle}
                        </Typography>
                        {/* <Typography className="text-xs font-normal text-blue-gray-500"> */}
                        {/*   {job[1]} */}
                        {/* </Typography> */}
                      </td>
                      <td className={className}>
                        <Chip
                          variant="gradient"
                          color={online ? "green" : "blue-gray"}
                          value={online ? "online" : "offline"}
                          className="py-0.5 px-2 text-[11px] font-medium w-fit"
                        />
                      </td>
                      <td className={className}>
                        <Typography className="text-xs font-semibold text-blue-gray-600">
                          {date}
                        </Typography>
                      </td>
                      <td className={className}>
                        <Button
                          onClick={handleOpen}
                          className="text-xs font-semibold text-blue-gray-600"
                        >
                          Ver estadisticas
                        </Button>
                      </td>
                    </tr>
                  );
                }
              )}
            </tbody>
          </table>
        </CardBody>
      </Card>
      {/* <Card> */}
      {/*   <CardHeader variant="gradient" color="gray" className="mb-8 p-6"> */}
      {/*     <Typography variant="h6" color="white"> */}
      {/*       Projects Table */}
      {/*     </Typography> */}
      {/*   </CardHeader> */}
      {/*   <CardBody className="overflow-x-scroll px-0 pt-0 pb-2"> */}
      {/*     <table className="w-full min-w-[640px] table-auto"> */}
      {/*       <thead> */}
      {/*         <tr> */}
      {/*           {["companies", "members", "budget", "completion", ""].map( */}
      {/*             (el) => ( */}
      {/*               <th */}
      {/*                 key={el} */}
      {/*                 className="border-b border-blue-gray-50 py-3 px-5 text-left" */}
      {/*               > */}
      {/*                 <Typography */}
      {/*                   variant="small" */}
      {/*                   className="text-[11px] font-bold uppercase text-blue-gray-400" */}
      {/*                 > */}
      {/*                   {el} */}
      {/*                 </Typography> */}
      {/*               </th> */}
      {/*             ) */}
      {/*           )} */}
      {/*         </tr> */}
      {/*       </thead> */}
      {/*       <tbody> */}
      {/*         {projectsTableData.map( */}
      {/*           ({ img, name, members, budget, completion }, key) => { */}
      {/*             const className = `py-3 px-5 ${ */}
      {/*               key === projectsTableData.length - 1 */}
      {/*                 ? "" */}
      {/*                 : "border-b border-blue-gray-50" */}
      {/*             }`; */}
      {/**/}
      {/*             return ( */}
      {/*               <tr key={name}> */}
      {/*                 <td className={className}> */}
      {/*                   <div className="flex items-center gap-4"> */}
      {/*                     <Avatar src={img} alt={name} size="sm" /> */}
      {/*                     <Typography */}
      {/*                       variant="small" */}
      {/*                       color="blue-gray" */}
      {/*                       className="font-bold" */}
      {/*                     > */}
      {/*                       {name} */}
      {/*                     </Typography> */}
      {/*                   </div> */}
      {/*                 </td> */}
      {/*                 <td className={className}> */}
      {/*                   {members.map(({ img, name }, key) => ( */}
      {/*                     <Tooltip key={name} content={name}> */}
      {/*                       <Avatar */}
      {/*                         src={img} */}
      {/*                         alt={name} */}
      {/*                         size="xs" */}
      {/*                         variant="circular" */}
      {/*                         className={`cursor-pointer border-2 border-white ${ */}
      {/*                           key === 0 ? "" : "-ml-2.5" */}
      {/*                         }`} */}
      {/*                       /> */}
      {/*                     </Tooltip> */}
      {/*                   ))} */}
      {/*                 </td> */}
      {/*                 <td className={className}> */}
      {/*                   <Typography */}
      {/*                     variant="small" */}
      {/*                     className="text-xs font-medium text-blue-gray-600" */}
      {/*                   > */}
      {/*                     {budget} */}
      {/*                   </Typography> */}
      {/*                 </td> */}
      {/*                 <td className={className}> */}
      {/*                   <div className="w-10/12"> */}
      {/*                     <Typography */}
      {/*                       variant="small" */}
      {/*                       className="mb-1 block text-xs font-medium text-blue-gray-600" */}
      {/*                     > */}
      {/*                       {completion}% */}
      {/*                     </Typography> */}
      {/*                     <Progress */}
      {/*                       value={completion} */}
      {/*                       variant="gradient" */}
      {/*                       color={completion === 100 ? "green" : "gray"} */}
      {/*                       className="h-1" */}
      {/*                     /> */}
      {/*                   </div> */}
      {/*                 </td> */}
      {/*                 <td className={className}> */}
      {/*                   <Typography */}
      {/*                     as="a" */}
      {/*                     href="#" */}
      {/*                     className="text-xs font-semibold text-blue-gray-600" */}
      {/*                   > */}
      {/*                     <EllipsisVerticalIcon */}
      {/*                       strokeWidth={2} */}
      {/*                       className="h-5 w-5 text-inherit" */}
      {/*                     /> */}
      {/*                   </Typography> */}
      {/*                 </td> */}
      {/*               </tr> */}
      {/*             ); */}
      {/*           } */}
      {/*         )} */}
      {/*       </tbody> */}
      {/*     </table> */}
      {/*   </CardBody> */}
      {/* </Card> */}
    </div>
  );
}

export default Tables;
