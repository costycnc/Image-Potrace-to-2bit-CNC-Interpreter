; =====================================================================
; MINIMAL 2-BIT HARDWARE CNC INTERPRETER (ATmega328P)
; R16 = Incoming byte containing 4 distinct move commands
; R17 = Internal loop counter (processes 4 moves)
; R18 = Temporary working register for bitmask isolation
; =====================================================================

DECODE_BYTE:
    LDI R17, 4              ; Reset loop counter for the 4 moves inside byte

PROCESS_STEP:
    MOV R18, R16            ; Copy main data byte to protect stream tracking
    ANDI R18, 0b11000000    ; Isolate the 2 Most Significant Bits (MSB)
    
    ; Shift the isolated bits all the way to the right for numerical matching
    LSL R18
    ROL R18
    LSL R18
    ROL R18

    ; --- BARE-METAL PARSER LOGIC ---
    CPI R18, 0b00
    BREQ MOVE_RIGHT         ; 00 -> Right
    CPI R18, 0b01
    BREQ MOVE_LEFT          ; 01 -> Left
    CPI R18, 0b10
    BREQ MOVE_UP            ; 10 -> Up
    ; If none match, binary state is implicitly 0b11 -> Down

MOVE_DOWN:
    ; [Insert hardware pulse logic for Motor Y, Direction Backwards]
    RJMP SHIFT_STREAM

MOVE_RIGHT:
    ; [Insert hardware pulse logic for Motor X, Direction Forwards]
    RJMP SHIFT_STREAM

MOVE_LEFT:
    ; [Insert hardware pulse logic for Motor X, Direction Backwards]
    RJMP SHIFT_STREAM

MOVE_UP:
    ; [Insert hardware pulse logic for Motor Y, Direction Forwards]
    RJMP SHIFT_STREAM

SHIFT_STREAM:
    LSL R16                 ; Shift main data register left by 2 positions
    LSL R16                 ; Bringing the next 2-bit move packet to the head
    DEC R17                 ; Decrement move count index
    BRNE PROCESS_STEP       ; If current byte still has moves left, loop
    RET                     ; Byte empty. Return to fetch next byte from Serial.
