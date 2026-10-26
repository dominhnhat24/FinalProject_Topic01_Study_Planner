export function getDateParts(
  value: string | Date,
  timezone: string,
) {
  const parts = new Intl.DateTimeFormat(
    "en-US",
    {
      timeZone: timezone,
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    },
  ).formatToParts(new Date(value));

  return {
    year: parts.find(
      (part) => part.type === "year",
    )?.value ?? "0000",

    month: parts.find(
      (part) => part.type === "month",
    )?.value ?? "01",

    day: parts.find(
      (part) => part.type === "day",
    )?.value ?? "01",
  };
}

export function formatInTimezone(
  value: string | Date,
  timezone: string,
  options: Intl.DateTimeFormatOptions = {},
) {
  return new Intl.DateTimeFormat(
    "vi-VN",
    {
      timeZone: timezone,
      ...options,
    },
  ).format(new Date(value));
}

export function dateKeyInTimezone(
  value: string | Date,
  timezone: string,
) {
  const parts = getDateParts(
    value,
    timezone,
  );

  return `${parts.year}-${parts.month}-${parts.day}`;
}

function addDaysToDateKey(
  key: string,
  days: number,
) {
  const [year, month, day] =
    key.split("-").map(Number);

  const date = new Date(
    Date.UTC(
      year,
      month - 1,
      day + days,
    ),
  );

  return date
    .toISOString()
    .slice(0, 10);
}

export function dueLabel(
  value: string,
  timezone: string,
) {
  const targetKey =
    dateKeyInTimezone(
      value,
      timezone,
    );

  const todayKey =
    dateKeyInTimezone(
      new Date(),
      timezone,
    );

  const tomorrowKey =
    addDaysToDateKey(
      todayKey,
      1,
    );

  const time =
    formatInTimezone(
      value,
      timezone,
      {
        hour: "2-digit",
        minute: "2-digit",
      },
    );

  if (targetKey === todayKey) {
    return `Hôm nay · ${time}`;
  }

  if (targetKey === tomorrowKey) {
    return `Ngày mai · ${time}`;
  }

  return `${
    formatInTimezone(
      value,
      timezone,
      {
        day: "2-digit",
        month: "2-digit",
      },
    )
  } · ${time}`;
}