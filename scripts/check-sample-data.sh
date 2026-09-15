#!/usr/bin/env bash
# Guards hard rule #2: no real client or person data in sample content.
# Run from the repo root:  ./scripts/check-sample-data.sh
# Exits non-zero if anything on the banned list appears, so it can gate a deploy.

set -uo pipefail
cd "$(dirname "$0")/.."

# Names that must never appear again, plus artifacts of real data
# Real organisations and people that must never appear in sample data.
# Brightpath/Cobalt/Halcyon were shipped by mistake and each collides with a
# real business — BrightPath Health is a live telehealth company, Cobalt.io and
# several Cobalt logistics firms exist, and Halcyon Freight Ltd is registered.
BANNED=(
  Mediaocean Satish Mandalika Hallmark Crissi Matthews Procom Northwind
  Spyglass Prisma "24 Seven" "Agency Client" "1399407300"
  Brightpath BrightPath Cobalt Halcyon Northgate
)

# Approved fictional roster — anything else that looks like sample identity
# should be checked by a human before shipping.
# Invented company names, each web-searched and returning zero company results.
# Re-verify before adding any new one — a plausible name is not a safe one.
APPROVED=(
  "Verrida Health" "Kestrelbrook Devices" "Marrowfield Platforms" "Aldervane Freight"
  "Dana Rivera" "Marcus Vale" "Priya Anand" "Leo Fontaine" "Nadia Cole"
  "Omar Reyes" "Sofia Marin" "Grace Kim"
)

# The one genuine address on the page (the contact sheet destination). Everything
# else that looks like an email must use a reserved TLD.
REAL_CONTACT="marcos@ollinos.com"

# Form placeholder text — interface chrome, not sample data about anyone.
UI_PLACEHOLDERS="you@company.com"

TARGETS=(index.html)
fail=0

echo "Checking sample data in: ${TARGETS[*]}"
echo

for name in "${BANNED[@]}"; do
  if hits=$(grep -rIni -- "$name" "${TARGETS[@]}" 2>/dev/null); then
    echo "BANNED TERM FOUND: '$name'"
    echo "$hits" | sed 's/^/    /'
    fail=1
  fi
done

# Sample email addresses must use a reserved TLD that can never resolve
if bad=$(grep -rIoEh '[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}' "${TARGETS[@]}" 2>/dev/null \
         | grep -vE '\.(example|invalid|test|localhost)$' \
         | grep -vxF "$REAL_CONTACT" | grep -vxF "$UI_PLACEHOLDERS" | sort -u); then
  if [ -n "$bad" ]; then
    echo "EMAIL NOT USING A RESERVED TLD (use .example):"
    echo "$bad" | sed 's/^/    /'
    fail=1
  fi
fi

if [ "$fail" -eq 0 ]; then
  echo "PASS — no banned terms; all sample emails use reserved TLDs."
  echo
  echo "Approved roster in use:"
  for n in "${APPROVED[@]}"; do
    c=$(grep -rIoh -- "$n" index.html 2>/dev/null | wc -l | tr -d ' ')
    [ "$c" != "0" ] && printf '    %-20s %s\n' "$n" "$c"
  done
  exit 0
fi

echo
echo "FAIL — fix the above before shipping. See hard rule #2 in README.md."
exit 1
