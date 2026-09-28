#!/usr/bin/env bash
set -e
P="PVT_kwHOAfefzM4Bhha3"
FIELD="PVTSSF_lAHOAfefzM4Bhha3zhgc3FY"
DONE="3a519a33"; PROG="55cd869d"; BUG="288c8e1f"

set_status() { # issue# statusOptionId
  item=$(gh project item-add 10 --owner Poom5741 --url "https://github.com/Poom5741/netzero-app/issues/$1" --format json -q '.id')
  gh project item-edit --id "$item" --project-id "$P" --field-id "$FIELD" --single-select-option-id "$2" >/dev/null
  echo "issue #$1 -> $2"
}

for i in 150 151 152 153 154 155; do set_status $i $DONE; done
for i in 156 157; do set_status $i $PROG; done
for i in 158 159 160 161 162 163; do set_status $i $BUG; done
