import type { AgendaItem } from "@/database/event.model";

const EventAgenda = ({agendaItems}: {agendaItems: AgendaItem[]}) => (
    <div className="agenda">
        <h2>Agenda</h2>
        <ul>
            {agendaItems.map(({time, item}, index) => (
                <li key={`${time}-${item}-${index}`}>{time} {item}</li>
            ))}
        </ul>
    </div>
)

export default EventAgenda;
