/* "what do you need?": one pill checkbox per chip in data/services.js (the three services + not sure yet). */
import { serviceChips } from '../../data/services';
import { FORM_COPY } from './copy';

export default function ServiceChips({ selected, onToggle }) {
  return (
    <fieldset className="field">
      <legend>{FORM_COPY.servicesLegend} <span className="tag-req">{FORM_COPY.servicesTag}</span></legend>
      <div className="chips">
        {serviceChips.map((chip) => (
          <label className="chip" key={chip.key}>
            <input
              type="checkbox"
              name="services[]"
              value={chip.name}
              checked={selected.includes(chip.name)}
              onChange={(e) => onToggle(chip, e.target.checked)}
            />
            <span>{chip.name}</span>
          </label>
        ))}
      </div>
    </fieldset>
  );
}
