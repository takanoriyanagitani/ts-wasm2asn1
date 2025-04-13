(module

  (import "wasi_snapshot_preview1" "fd_write"
    (func $fd_write (param i32 i32 i32 i32) (result i32))
  )

  (memory (export "memory") 1)

  (func $add32i (param $x i32) (param $y i32) (result i32)
    local.get $x
    local.get $y

    i32.add
  )

  (func $add64i (param $x i64) (param $y i64) (result i64)
    local.get $x
    local.get $y

    i64.add
  )

  (func $_start (export "_start")
    (i32.store (i32.const 0) (i32.const 8))
    (i32.store (i32.const 4) (i32.const 4))

    (call $fd_write
      (i32.const 1)
      (i32.const 0)
      (i32.const 1)
      (i32.const 12)
    )

    drop
  )

  (export "add_integer" (func $add32i))
  (export "add_long"    (func $add64i))

  (data (i32.const 8) "helo")

)
